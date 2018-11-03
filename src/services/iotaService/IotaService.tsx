import { composeAPI, AccountData } from '@iota/core'
import { asciiToTrytes, trytesToAscii } from '@iota/converter'
import { asTransactionObject } from '@iota/transaction-converter'
import { IBaseMessage, MessageMethod, ITextMessage, IContactResponse, Permission, IContactRequest, IMessageResponse } from '../../services/iotaService/interfaces';
import { getRandomSeed, arrayDiff } from '../../utils';
import { asyncForEach } from '../../utils';
import { EventHandler } from '../../utils/EventHandler';
import { Ice } from 'src/entities/Ice';
import { diff, DiffData } from 'fast-array-diff'
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

    public async sendContactRequest(addr: string, permission: Permission, ownAddress: string, myName: string) {
        const message: IContactRequest = {
            method: MessageMethod.ContactResponse,
            name: myName,
            secret: this.createSecret(),
            address: addr,
            senderAddress: ownAddress,
            time: new Date().getTime()
        }
        return await this.sendToTangle(message)
    }

    public async sendContactResponse(addr: string, permission: Permission, ownAddress: string, myName: string) {
        const message: IContactResponse = {
            method: MessageMethod.ContactResponse,
            name: myName,
            secret: this.createSecret(),
            level: permission,
            address: addr,
            senderAddress: ownAddress,
            time: new Date().getTime()
        }
        return await this.sendToTangle(message)
    }

    public async bootstrapMessenger() {
        const accountData: AccountData = await this.api.getAccountData(this.seed)
        if(accountData.addresses.length  === null){
            // todo create new address because seed is new and empty
            console.log('todo create new address')
        }
        try{
            await this.getObjectsFromTangle(accountData.addresses as [])
        } catch(error){
            console.error(error);
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
        const contactRespone: IContactResponse[] = []
        const ice: IICERequest[] = []
        rawObjects.forEach((m: any) => {
            switch (m.method) {
                case MessageMethod.Message: {
                    messages.push(m as ITextMessage)
                    if(!this.isBootStrapped){
                        this.ownAddress = m.address;
                    }
                    break;
                }
                case MessageMethod.ContactRequest: {
                    contactRequests.push(m as IContactRequest)
                    break;
                }
                case MessageMethod.ContactResponse: {
                    contactRespone.push(m as IContactResponse)
                    break; 
                }
                case MessageMethod.ICE: {
                    ice.push(m as IICERequest)
                    break;
                }
            }
        })
        console.log(messages)
        messages.length > 0 && this.publish('message', messages)
        contactRequests.length > 0 && this.publish('contactRequest', contactRequests)
        contactRespone.length && this.publish('contactRespone', contactRespone)
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

    private createSecret() {
        return getRandomSeed().substring(0,20);
    }

    private convertToObject(tryt: string): any {
        const transaction = asTransactionObject(tryt);
        if (transaction.signatureMessageFragment.replace(/9+$/, '') === '') {
            return;
        }
        const object = this.parseMessage(trytesToAscii(transaction.signatureMessageFragment.replace(/9+$/, '')));
        if (object === null || object === undefined) {
            return;
        }
        if (!object.message || object.method === undefined || object.secret === undefined) {
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