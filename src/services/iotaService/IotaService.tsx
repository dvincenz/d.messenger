import { composeAPI } from '@iota/core'
import { asciiToTrytes, trytesToAscii } from '@iota/converter'
import { asTransactionObject } from '@iota/transaction-converter'
import { IMessageResponse, IContactRequest } from '.';
import {IBaseMessage, MessageMethod, ITextMessage} from './interfaces';
import {Contact} from "../../entity/Contact";
import {IContactResponse} from "./interfaces/IContactResponse";
import {Permission} from "./interfaces/IBaseMessage";

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
        return this.sendMessage(address, msg);
    }

    public async sendContactRequest (address: string, ownAddress: string) {
        const message: IContactRequest = {
            method: MessageMethod.ContactRequest,
            name: this.createChatName(),
            address: ownAddress,
        }
        await this.sendMessage(address, message)
        return
    }

    public async sendContactResponse (address: string, permission: Permission, ownAddress: string) {
        const message: IContactResponse = {
            method: MessageMethod.ContactResponse,
            name: this.createChatName(),
            level: permission,
            address: ownAddress,
        }
        await this.sendMessage(address, message)
        return
    }

    public async sendMessage (addr: string, message: IBaseMessage) {
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

    public getMessages() {
        return this.textMessages
    }

    public getContacts() {
        return this.contacts
    }

    public async loadData(addr:string[], activeAddr:string) {
        const messages = await this.getMessagesFromAddresses(addr)
        messages.forEach(msg => {
            switch (msg.method) {
                case MessageMethod.Message: {
                    this.textMessages.push(msg)
                    break;
                }
                case MessageMethod.ContactRequest: {
                    const contact = new Contact(msg.name, msg.address)
                    this.contacts.push(contact)
                    break;
                }
                case MessageMethod.ContactResponse: {
                    if(msg.level === Permission.accepted) {
                        const contact = new Contact(msg.name, msg.address)
                        contact.State = true
                        this.contacts.push(contact)
                    }
                    break;
                }
            }
        })

        this.contacts.forEach(contact => {
            if(contact.State) {
                return;
            }
            this.checkAcceptedStateOfContactRequests(contact, activeAddr)
        })
    }

    private async getMessagesFromAddresses(addr:string[]) {
        const query: any = {
            addresses: addr,
        };
        const hashes = await this.api.findTransactions(query)
        const trytes = await this.api.getTrytes(hashes)

        return this.getMessagesFromTrytes(trytes)
    }

    private async checkAcceptedStateOfContactRequests(contact:Contact, activeAddr:string) {
        const addr:string[] = []
        addr.push(contact.Address)

        const messages = await this.getMessagesFromAddresses(addr)
        messages.forEach(msg => {
            if (msg.method === MessageMethod.ContactResponse) {
                if(msg.address === activeAddr) {
                    if(msg.level === Permission.accepted) {
                        contact.State = true
                    }
                }
            }
        })
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

                const message: IMessageResponse = {
                    name: (messageObject as ITextMessage).name,
                    message: (messageObject as ITextMessage).message,
                    time: transaction.timestamp,
                    address: (messageObject as IMessageResponse).address,
                    level: (messageObject as IMessageResponse).level,
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
