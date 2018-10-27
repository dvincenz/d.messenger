import { composeAPI } from '@iota/core'
import { asciiToTrytes, trytesToAscii } from '@iota/converter'
import { asTransactionObject } from '@iota/transaction-converter'
import { IBaseMessage, MessageMethod, ITextMessage, IMessageResponse, IContactRequest  } from '../../models/interfaces';
import { Message, MessageStatus } from '../../models';

/*iotaService wrapper is build as no react component -> todo move to best practise in ract*/

export class Iota {
    private provider: string;
    private seed: string;
    private ownAddress: string;
    private minWeightMagnitude: number;
    private api: any;

    constructor(provider: string, seed: string, ownAddress: string = '') {
        this.provider = provider;
        this.seed = seed;
        this.minWeightMagnitude = 14
        this.connectWithNode();
        if(ownAddress === ''){
            this.getAllMessages();
        }
    }

    public async getMessages(addr: string) {
        console.log('get from tangle');
        const messages = await this.getMessagesFromTangle([addr, this.ownAddress]);
        return messages.sort((a, b) => a.time > b.time ? 1 : -1);

    }

    public async sendMessage(message: Message) {
        // todo may do some checks of used simboles and size of message to prevent errors
        const msg: ITextMessage = {
            message: message.message,
            method: MessageMethod.Message,
            name: message.name
        }
        return await this.sendToTangle(message.address, msg);
    }

    public async ContactRequest() {
        // todo  request contacts

    }

    public async refrashContact(lastHash: string) {
        // todo this method should get messages from seed to check new incoming messages and contact requests
    }



    private async sendContactRequest (address: string) {
        const message: IContactRequest = {
            method: MessageMethod.ContactRequest,
            name: this.createChatName(),
        }
        return await this.sendToTangle(address, message)
    }

    // #### Internale Methods ####

    private async sendToTangle (addr: string, message: IBaseMessage) {
        const trytesMessage = asciiToTrytes(JSON.stringify(message));
        const transfer = [{
            address: addr,
            message: trytesMessage,
            value: 0,
        }];
        const trytes = await this.api.prepareTransfers(this.seed, transfer)
        return await this.api.sendTrytes(trytes, 2, this.minWeightMagnitude)
    }



    private async getAllMessages(){
        // todo implement method to get all information from the block chain, only needed if local storage is empty.
        return await console.log('get root infromation is not implemented yet')
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

    private async getMessagesFromTangle(addr: string[]) {
        const rawObjects = await this.getFromTangle(addr);
        const messages: Message[] = []
        rawObjects.forEach((m: any) => {
            if(m.method === MessageMethod.Message){
                messages.push(m as Message)
            }
        })
        return messages
    }


    private async getFromTangle (addr: string[]) {
        debugger;
        const query: any = {
            addresses: addr,
        };
        const hashes = await this.api.findTransactions(query)
        const trytes = await this.api.getTrytes(hashes)
        const convertedObjects: any[] = [];
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
                convertedObjects.push(messageObject)            
            }
        )
        return convertedObjects;
    }

    // #### Helper Methods ###

    private parseMessage(str: string) {
        try {
            JSON.parse(str);
        } catch (e) {
            return null;
        }
        return JSON.parse(str);
    }

    private createChatName() {
        // todo user name & and random address per request
        return 'dvincenz@FASKJNWODFNLASDM'
    }
}
