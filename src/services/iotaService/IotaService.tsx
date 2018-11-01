import { composeAPI } from '@iota/core'
import { asciiToTrytes, trytesToAscii } from '@iota/converter'
import { asTransactionObject } from '@iota/transaction-converter'
import { IBaseMessage, MessageMethod, ITextMessage, IContactResponse, Permission, IContactRequest } from '../../entities/interfaces';
import { getRandomSeed } from '../../utils';


export class Iota {
    private provider: string;
    private seed: string;
    private ownAddress: string;
    private minWeightMagnitude: number;
    private api: any;

    constructor(provider: string, seed: string, ownAddress: string) {
        this.provider = provider;
        this.seed = seed;
        this.minWeightMagnitude = 14
        this.connectWithNode();
        this.ownAddress = ownAddress;
    }

    public async getMessages(addr: string): Promise<IBaseMessage[]> {
        try {
            let messages = await this.getObjectsFromTangle([addr, this.ownAddress]);
            messages = messages.filter(m => m.method === MessageMethod.Message);
            return messages.sort((a, b) => a.time > b.time ? 1 : -1);
        } catch (error){
            console.error(error)
            return [];
        }
    }
    

    public async getContacts(){
        try {
            // todo get own contact requests => need to fetch this contacts on seed sended messages because address is not knowing
            const contacts = await this.getObjectsFromTangle([this.ownAddress]);
            return contacts.filter(c => c.method === MessageMethod.ContactRequest || c.method === MessageMethod.ContactResponse);
        } catch (error){
            console.error(error)
            return [];
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

    // #### Internale Methods ####

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

    private async getAllMessages() {
        // todo implement method to get all information from the block chain, only needed if local storage is empty.
        return await console.log('get root infromation is not implemented yet')
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

    private async getObjectsFromTangle(addr: string[]): Promise<IBaseMessage[]> {
        const rawObjects = await this.getFromTangle(addr);
        const messages: IBaseMessage[] = []
        rawObjects.forEach((m: any) => {
            switch (m.method) {
                case MessageMethod.Message: {
                    messages.push(m as ITextMessage)
                    break;
                }
                case MessageMethod.ContactRequest: {
                    messages.push(m as IContactRequest)
                    break;
                }
                case MessageMethod.ContactResponse: {
                    messages.push(m as IContactResponse)
                    break;
                }
            }
        })
        return messages
    }

    private async getFromTangle(addr: string[]) {
        const query: any = {
            addresses: addr,
        };
        let trytes: any = []
        try {
            const hashes = await this.api.findTransactions(query)
            trytes = await this.api.getTrytes(hashes)
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
            console.log('some messages dosent match to the given pattern');
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