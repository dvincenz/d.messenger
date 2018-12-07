import {composeAPI, AccountData} from '@iota/core'
import {asciiToTrytes, trytesToAscii} from '@iota/converter'
import {asTransactionObject} from '@iota/transaction-converter'
import {
    IBaseMessage,
    MessageMethod,
    ITextMessage,
    IContactResponse,
    Permission,
    IContactRequest
} from '../../services/iotaService/interfaces';
import {getRandomSeed, arrayDiff, asyncForEach} from '../../utils';
import {EventHandler} from '../../utils/EventHandler';
import {IICERequest} from './interfaces/IICERequest';
import {Transaction} from "@iota/core/typings/types";
import { IPublicContact } from './interfaces/IPublicContact';
import { EncriptionService } from '../encriptionService';
import Timer = NodeJS.Timer;



export class Iota extends EventHandler {
    public get myAddress(): string {
        return this.ownAddress;
    }

    private provider: string;
    private seed: string;
    private ownAddress: string;
    private minWeightMagnitude: number;
    private api: any;
    private loadedHashes: string[];
    private isCallRunning: boolean = false;
    private isBootStrapped: boolean = false;
    private broadcastAddress = 'DMESSENGERDMESSENGERDMESSENGERDMESSENGERDMESSENGERDMESSENGERDMESSENGERDMESSENGERD'

    private checkForNewMessageTimer: Timer;

    constructor(provider: string, seed: string) {
        super();
        this.provider = provider;
        this.seed = seed;
        this.minWeightMagnitude = 9
        this.connectWithNode();
        this.loadedHashes = []
    }

    public async getMessages(addr: string) {
        try {
            if (this.bootstrapMessenger) {
                await this.getObjectsFromTangle([addr], [MessageMethod.ContactRequest, MessageMethod.ContactResponse, MessageMethod.Message]);
            }
            return;
        } catch (error) {
            console.error(error)
            return;
        }
    }

    public async sendMessage(message: ITextMessage) {
        // todo may do some checks of used simboles and size of message to prevent errors
        return await this.sendToTangle(message);
    }

    public async publishMyPublicKey(key: string, myName: string) {
        if(this.isBootStrapped !== true){
            throw new Error("IOTA Service is not bootstraped, please Bootstrap first the service bevore you publish your contact")
        }
        const toPublishAddress: IPublicContact = {
            address: this.broadcastAddress,
            method: MessageMethod.AddressPublish,
            myAddress: this.myAddress,
            publicKey: key,
            time: Date.now(),
            name: myName,
            isEncripted: false,
        } 
        return await this.sendToTangle(toPublishAddress)
    }

    public async sendContactRequest(addr: string, ownAddress: string, myName: string, isGrp: boolean) {
        const message: IContactRequest = {
            method: MessageMethod.ContactRequest,
            name: myName,
            secret: getRandomSeed(20),
            address: addr,
            senderAddress: ownAddress,
            time: new Date().getTime(),
            isGroup: isGrp,
            isEncripted: !isGrp
        }
        return await this.sendToTangle(message)
    }

    public async searchContactByName(name: string){
        const contacts = await this.getFromTangle([this.broadcastAddress], [name], true);
        return contacts.filter(c => (c as IPublicContact).name !== undefined && (c as IPublicContact).myAddress !== undefined); 
    }

    public async sendContactResponse(addr: string, permission: Permission, ownAddress: string, myName: string, key: string) {
        const message: IContactResponse = {
            method: MessageMethod.ContactResponse,
            name: myName,
            secret: key,
            level: permission,
            address: addr,
            senderAddress: ownAddress,
            time: new Date().getTime(),
            isEncripted: true
        }
        return await this.sendToTangle(message)
    }

    public async sendIceRequest(ice: IICERequest) {
        try {
            const returnvalue = await this.sendToTangle(ice)
            return returnvalue[0].timestamp
        } catch (error) {
            console.error('error sending ice to tangle ' + error)
        }
    }

    public dispose() {
        clearInterval(this.checkForNewMessageTimer);
    }

    // #### Internale Methods ####
    public async bootstrapMessenger() {
        const accountData: AccountData = await this.api.getAccountData(this.seed)
        try {
            await this.getObjectsFromTangle(accountData.addresses as [], [MessageMethod.ContactRequest, MessageMethod.ContactResponse, MessageMethod.Message])
            // tofix hack: add old ice request to hash cache to prevent loading old ice request on startup messanger
            const query = {addresses: accountData.addresses as [], tags: [asciiToTrytes(MessageMethod.ICE.toString())] }
            const hashes = await this.api.findTransactions(query)
            this.loadedHashes = this.loadedHashes.concat(hashes)
        } catch (error) {
            console.error(error);
        }
        if (this.ownAddress === undefined) {
            this.ownAddress = await this.api.getNewAddress(this.seed)
        }
        this.isBootStrapped = true;
        this.checkForNewMessageTimer = setInterval(async () => {
            await this.checkForNewMessages();
        }, 5000);
    }

    private async checkForNewMessages() {
        if (this.isCallRunning) {
            return;
        }
        this.isCallRunning = true;
        try {
            this.getObjectsFromTangle([this.ownAddress], [MessageMethod.ContactRequest, MessageMethod.ContactResponse, MessageMethod.ICE, MessageMethod.Message])
        } catch (error) {
            console.error('error fetching message: ' + error);
        } finally {
            this.isCallRunning = false;
        }
    }

    private async sendToTangle(message: IBaseMessage) {
        const addr = message.address
        let trytesMessage: any
        let inputTag = asciiToTrytes(message.method.toString())
        if(message.method === MessageMethod.AddressPublish){
            inputTag = asciiToTrytes(((message as IPublicContact).name)).substring(0, 27)
        }
        if(message.isEncripted){
            trytesMessage = asciiToTrytes(await EncriptionService.encript(this.stringify(message), addr));
        }else{
            trytesMessage = asciiToTrytes(this.stringify(message));
        }
        const transfer = [{
            address: addr,
            message: trytesMessage,
            value: 0,
            tag: inputTag,
        }];
        
        try {
            const trytes = await this.api.prepareTransfers(this.seed, transfer)
            return await this.api.sendTrytes(trytes, 2, this.minWeightMagnitude)
        } catch (error) {
            console.error(error);
            return
        }
    }

    private async connectWithNode() {
        this.api = composeAPI({
            provider: this.provider
        })
        this.api.getNodeInfo((error: any, success: any) => {
            if (error) {
                console.error(error);
            }
        });
    }

    private async getObjectsFromTangle(addr: string[], tags: MessageMethod[] = []) {
        const rawObjects = await this.getFromTangle(addr, tags.map(t => t.toString()));
        const messages: ITextMessage[] = []
        const contactRequests: IContactRequest[] = []
        const contactResponse: IContactResponse[] = []
        const ice: IICERequest[] = []
        const addressPublish: IPublicContact[] = []
        rawObjects.forEach((m: any) => {
            if (!this.isBootStrapped) {
                this.ownAddress = m.address;
            }
            switch (m.method) {
                case MessageMethod.Message: {
                    messages.push(m as ITextMessage)
                    break;
                }
                case MessageMethod.ContactRequest: {
                    if (this.ownAddress === undefined || (this.ownAddress === m.address || m.senderAddress === this.ownAddress)) {
                        contactRequests.push(m as IContactRequest)
                    }
                    break;
                }
                case MessageMethod.ContactResponse: {
                    if (this.ownAddress === undefined || (this.ownAddress === m.address || m.senderAddress === this.ownAddress)) {
                        contactResponse.push(m as IContactResponse)
                    }
                    break;
                }
                case MessageMethod.AddressPublish:{
                    if(m.name !== undefined && m.myaddress !== undefined){
                        addressPublish.push(m as IPublicContact)
                    }
                }
                case MessageMethod.ICE: {
                    ice.push(m as IICERequest)
                    break;
                }
            }
        })
       
        messages.length > 0 && this.publish('message', messages)
        contactRequests.length > 0 && this.publish('contactRequest', contactRequests)
        contactResponse.length && this.publish('contactResponse', contactResponse)
        ice.length > 0 && this.publish('ice', ice)
        addressPublish.length > 0 && this.publish('contact', addressPublish)
    }

    private async getFromTangle(addr: string[], tags: string[], ignoreCache = false) {
        const query: any = {
            addresses: addr,
            tags: tags.length > 0 !== undefined ? tags.map(t => asciiToTrytes(t)) : undefined
        };
        let trytes: any = []
        try {
            const hashes = await this.api.findTransactions(query)
            const newHashes = arrayDiff(this.loadedHashes, hashes)
            if((ignoreCache && hashes.length > 0) || newHashes.length > 0){
                this.loadedHashes = this.loadedHashes.concat(newHashes)
                trytes = await this.api.getTrytes(ignoreCache ? hashes : newHashes)
            }
            
        } catch (error) { 
            console.error(error);
            return [];
        }
        const convertedObjects: IBaseMessage[] = [];
        const bundleObjects: any[] = trytes.filter((tryt: any) => {
            const transaction: Transaction = asTransactionObject(tryt);
            return transaction.lastIndex > 0;
        });
        
        await asyncForEach(trytes, async (tryt: any) => {
            const object = await this.convertToObject(tryt, bundleObjects)
            if (object !== undefined) {
                convertedObjects.push(object);
            }
        });
        return convertedObjects;
    }

    // #### Helper Methods ###

    private async convertToObject(tryt: string, bundleObjects: any[]): Promise<any> {
        const transaction = asTransactionObject(tryt);
        let messageToConvert;
        if (transaction.signatureMessageFragment.replace(/9+$/, '') === '') {
            return;
        }
        if (transaction.lastIndex > 0 && transaction.currentIndex === 0) {
            messageToConvert = this.convertBundleToObject(tryt, bundleObjects);
        }
        if (transaction.lastIndex === 0) {
            messageToConvert = transaction.signatureMessageFragment
        }
        if (messageToConvert !== undefined) {
            let object: any;
            try {
                object = await this.decript(trytesToAscii(messageToConvert.replace(/9+$/, '')));
            } catch (error) {
                console.log('messages not designed for d.messenger are available on this address');
                return;
            }

            return this.checkObject(object, transaction);
        }
        return
    }

    private convertBundleToObject(tryt: string, bundleObjects: any[]): any {
        const transaction: Transaction = asTransactionObject(tryt);
        const signatureMessageFragmentTryt: string =
            bundleObjects
                .map((bundleTryt: any) => {
                    const trx: Transaction = asTransactionObject(bundleTryt);
                    return trx;
                })
                .filter((trx: Transaction) => {
                    return trx.bundle === transaction.bundle;
                })
                .sort((a: Transaction, b: Transaction) => a.currentIndex - b.currentIndex)
                .map((trx: Transaction) => {
                    return trx.signatureMessageFragment;
                })
                .join('');
        return signatureMessageFragmentTryt
    }


    private stringify(message: IBaseMessage) {
        delete message.address;
        delete message.hash;
        delete message.time;
        delete message.method;
        delete message.isEncripted
        return JSON.stringify(message);
    }

    private async decript(str: string) {
        let object;
        try {
            object = JSON.parse((await EncriptionService.decript(str)) as string);
        } catch (e) {
            try {
                object = JSON.parse(str);
            } catch(e){
                return null;
            }
        }
        return object;
    }

    private checkObject(object: any, transaction: Transaction) {
        if (object === null || object === undefined) {
            return;
        }
        object.method = parseInt(trytesToAscii(transaction.tag.replace(/9+$/, '')),10)
        if ((!object.method && object.method === MessageMethod.Message) || object.method === undefined) {
            return;
        }
        if(transaction.address === this.broadcastAddress && (object.name === undefined || object.myAddress === undefined)){
            return;
        }
        object.address = transaction.address;
        object.hash = transaction.hash;
        object.time = transaction.timestamp;
        return object;
    }
}