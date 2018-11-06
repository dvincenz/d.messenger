import { composeAPI, AccountData } from '@iota/core'
import { asciiToTrytes, trytesToAscii } from '@iota/converter'
import { asTransactionObject } from '@iota/transaction-converter'
import { IBaseMessage, MessageMethod, ITextMessage, IContactResponse, Permission, IContactRequest } from '../../services/iotaService/interfaces';
import { getRandomSeed, arrayDiff } from '../../utils';
import { EventHandler } from '../../utils/EventHandler';
import { IICERequest } from './interfaces/IICERequest';



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

    constructor(provider: string, seed: string) {
        super();
        this.provider = provider;
        this.seed = seed;
        this.minWeightMagnitude = 14
        this.connectWithNode();
        this.loadedHashes =  []
    }

    
    
    public async getMessages(addr: string) {
        try {
            if(this.bootstrapMessenger){
                await this.getObjectsFromTangle([addr]);
            }
            return;
        } catch (error){
            console.error(error)
            return;
        }
    }
    
    public async sendMessage(message: ITextMessage) {
        // todo may do some checks of used simboles and size of message to prevent errors
        return await this.sendToTangle(message);
    }

    public async sendContactRequest(addr: string, ownAddress: string, myName: string) {
        const message: IContactRequest = {
            method: MessageMethod.ContactRequest,
            name: myName,
            secret: getRandomSeed(20),
            address: addr,
            senderAddress: ownAddress,
            time: new Date().getTime()
        }
        return await this.sendToTangle(message)
    }

    public async sendContactResponse(addr: string, permission: Permission, ownAddress: string, myName: string, key: string) {
        const message: IContactResponse = {
            method: MessageMethod.ContactResponse,
            name: myName,
            secret: key,
            level: permission,
            address: addr,
            senderAddress: ownAddress,
            time: new Date().getTime()
        }
        return await this.sendToTangle(message)
    }

    public async sendIceRequest(ice: IICERequest){
        try{
            await this.sendToTangle(ice)
        }catch (error){
            console.error('error sending ice to tangle ' + error)
        }
    }

    public async bootstrapMessenger() {
        const accountData: AccountData = await this.api.getAccountData(this.seed)
        try{
            await this.getObjectsFromTangle(accountData.addresses as [])
        } catch(error){
            console.error(error);
        }
        if(this.ownAddress === undefined){
            this.ownAddress = await this.api.getNewAddress(this.seed)
        }
        this.isBootStrapped = true;
        setInterval(async () => {
            await this.checkForNewMessages();
          }, 5000);
    } 


    // #### Internal Methods ####

    private async checkForNewMessages(){
        if(this.isCallRunning){
            return;
        }
        this.isCallRunning = true;
        try{
            this.getObjectsFromTangle([this.ownAddress])
        } catch (error){
            console.error('error fetching message: '+ error);
        } finally {
            this.isCallRunning = false;
        }

    }

    private async sendToTangle(message: IBaseMessage) {
        const addr = message.address
        const trytesMessage = asciiToTrytes(this.stringify(message));
        const transfer = [{
            address: addr,
            message: trytesMessage,
            value: 0,
        }];
        
        try{
            const trytes = await this.api.prepareTransfers(this.seed, transfer)
            return await this.api.sendTrytes(trytes, 2, this.minWeightMagnitude)
        } catch (error){
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

    private async getObjectsFromTangle(addr: string[]) {
        const rawObjects = await this.getFromTangle(addr);
        const messages: ITextMessage[] = []
        const contactRequests: IContactRequest[] = []
        const contactResponse: IContactResponse[] = []
        const ice: IICERequest[] = []
        rawObjects.forEach((m: any) => {
            if(!this.isBootStrapped){
                this.ownAddress = m.address;
            }
            switch (m.method) {
                case MessageMethod.Message: {
                    messages.push(m as ITextMessage)
                    break;
                }
                case MessageMethod.ContactRequest: {
                    if(this.ownAddress === undefined || (this.ownAddress === m.address || m.senderAddress === this.ownAddress)){
                        contactRequests.push(m as IContactRequest)
                    }
                    break;
                }
                case MessageMethod.ContactResponse: {
                    if(this.ownAddress === undefined || (this.ownAddress === m.address || m.senderAddress === this.ownAddress)){
                        contactResponse.push(m as IContactResponse)
                    }
                    break; 
                }
                case MessageMethod.ICE: {
                    ice.push(m as IICERequest)
                    break;
                }
                default:
                    console.log('messages with wrong metadata dedected');
                    console.log(m);
                break;
            }
        })
        messages.length > 0 && this.publish('message', messages)
        contactRequests.length > 0 && this.publish('contactRequest', contactRequests)
        contactResponse.length && this.publish('contactResponse', contactResponse)
        ice.length > 0 && this.publish('ice', ice)
    }

    private async getFromTangle(addr: string[]) {
        const query: any = {
            addresses: addr,
        };
        let trytes: any = []
        try {
            const hashes = await this.api.findTransactions(query)
            const newHashes = arrayDiff(this.loadedHashes, hashes)
            trytes = await this.api.getTrytes(newHashes)
            this.loadedHashes = this.loadedHashes.concat(newHashes)
        } catch (error) { 
            console.error(error);
            return [];
        }
        const convertedObjects: IBaseMessage[] = [];
        trytes.forEach((tryt: any) => {
            const object = this.convertToObject(tryt)
            if(object !== undefined){
                convertedObjects.push(object);
            } 
        })

        return convertedObjects;
    }

    // #### Helper Methods ###

    private convertToObject(tryt: string): any {
        const transaction = asTransactionObject(tryt);
        if (transaction.signatureMessageFragment.replace(/9+$/, '') === '') {
            return;
        }
        const object = this.parseMessage(trytesToAscii(transaction.signatureMessageFragment.replace(/9+$/, '')));
        if (object === null || object === undefined) {
            return;
        }
        if ((!object.message && object.method === MessageMethod.Message) || object.method === undefined || object.secret === undefined) {
            return;
        }
        object.address = transaction.address;
        object.hash = transaction.hash;
        object.time = transaction.timestamp;
        return object
    }

    private stringify(message: IBaseMessage) {
        delete message.address;
        delete message.hash;
        delete message.time;
        return JSON.stringify(message);
    }

    private parseMessage(str: string) {
        try {
            JSON.parse(str);
        } catch (e) {
            return null;
        }
        return JSON.parse(str);
    }
}