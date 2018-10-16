import { composeAPI } from '@iota/core'
import { asciiToTrytes, trytesToAscii } from '@iota/converter'
import { asTransactionObject } from '@iota/transaction-converter'
import { IMessageResponse, IContactRequest } from '.';
import { IBaseMessage, MessageMethod, ITextMessage  } from './interfaces';
import { Contact } from '../../entities/Contact'

/*iotaService wrapper is build as no react component -> todo move to best practise in ract*/

export class Iota {
    private provider: string;
    private seed: string;
    private minWeightMagnitude: number;
    private api: any;
    private contacts: Contact[] = [];
    private textMessages: IMessageResponse[] = [];

    constructor(provider: string, seed: string) {
        this.provider = provider;
        this.seed = seed;
        this.minWeightMagnitude = 14
        this.connectWithNode();
    }

    public async sendTextMessage(address: string, text: string) {
        const msg: ITextMessage = {
            method: MessageMethod.Message,
            message: text,
            name: this.createChatName(),
        }
        return await this.sendMessage(address, msg);
    }

    public async sendContactRequest (address: string) {
        const message: IContactRequest = {
            method: MessageMethod.ContactRequest,
            name: this.createChatName(),
        }
        await this.sendMessage(address, message)
        return
    }

    public async sendMessage (addr: string, message: IBaseMessage) {
        const sendingMessage: IMessageResponse = {
            address: addr,
            message: (message as ITextMessage).message,
            name: message.name,
            time: -1,
            method: 2,
        }
        this.textMessages.push(sendingMessage)
        console.log(this.textMessages);
        const trytesMessage = asciiToTrytes(JSON.stringify(message));
        const transfer = [{
            address: addr,
            message: trytesMessage,
            value: 0,
        }];
        const trytes = await this.api.prepareTransfers(this.seed, transfer)
        await this.api.sendTrytes(trytes, 2, this.minWeightMagnitude)
        return
    }

    public async loadData(addr:string[]) {
        const query: any = {
            addresses: addr,
        };
        const hashes = await this.api.findTransactions(query)
        const trytes = await this.api.getTrytes(hashes)

        const messages = this.getMessagesFromTrytes(trytes)
        messages.forEach(msg => {
            switch (msg.method) {
                case MessageMethod.Message: {
                    this.textMessages.push(msg)
                    break;
                }
                case MessageMethod.ContactRequest: {
                    const contact = new Contact(msg.address, msg.address)
                    this.contacts.push(contact)
                    break;
                }
                case MessageMethod.ContactResponse: {
                    const contact = new Contact(msg.address, msg.address)
                    this.contacts.push(contact)
                    break;
                }
            }
        })
    }

    public async getMessages() {
        // todo remove quick fix, to not every time load all data

        if(this.textMessages.length === 0){
            await this.loadData(['LKVQLLCIWSFNRIY9YOHFNAMGHEZTPUEWDPWJWMCE9PRHMVWKIOPRCIMMTPCKEQH9GBQPKUNDBMODMMDMYNNISEAPYY'])
        }
        return this.textMessages
    }

    public async getContacts() {

         return this.contacts
    }

    private async connectWithNode(){
        this.api = composeAPI({
            provider: this.provider
        })
        this.api.getNodeInfo((error: any, success: any) => {
            if (error) {
                console.error(error);
            }
        });
                 
    }

    private createChatName() {
        // todo user name & and random address per request
        return 'dvincenz@FASKJNWODFNLASDM'
    }

    private getMessagesFromTrytes(trytes: string[]) {
        const messages: IMessageResponse[] = []
        trytes.forEach(
            (tryt: any) => {
                const transaction = asTransactionObject(tryt)
                if (transaction.signatureMessageFragment.replace(/9+$/, '') === '') {
                    return;
                }
                const messageObject = this.parseMessage(trytesToAscii(transaction.signatureMessageFragment.replace(/9+$/, '')));
                if (messageObject === null) {
                    console.log('some messages dosent match to the given pattern')
                    return;
                }
                if (!messageObject.message) {
                    return;
                }

                const message: IMessageResponse = {
                    name: (messageObject as ITextMessage).name,
                    message: (messageObject as ITextMessage).message,
                    time: transaction.timestamp,
                    address: transaction.address,
                    method: (messageObject as ITextMessage).method,
                }
                messages.push(message);
            }
        )
        return messages.sort((a, b) => a.time > b.time ? 1 : -1);
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
