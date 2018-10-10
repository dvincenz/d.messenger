import { composeAPI  } from '@iota/core'
import { asciiToTrytes, trytesToAscii } from '@iota/converter'
import { asTransactionObject } from '@iota/transaction-converter'
import { IMessageResponse, IContactRequest } from '.';
import { IBaseMessage, MessageMethod, ITextMessage  } from './interfaces';

/*iotaService wrapper is build as no react component -> todo move to best practise in ract*/ 

export class Iota {
    private provider: string;
    private seed: string;
    private minWeightMagnitude: number;
    private api: any;
    constructor(provider: string, seed: string) {
        this.provider = provider;
        this.seed = seed;
        this.minWeightMagnitude = 14
        this.connectWithNode();
    }

    public getMessage(){
        console.log('get messages for ' + this.seed + ' need to be implemented');
        
    }

    public sendTextMessage (address: string, text:string){
        const msg: ITextMessage = {
            mehtod: MessageMethod.Message,
            message: text,
            name: this.createChatName(),
        }
        this.sendMessage(address, msg);
    }
    public sendMessage(address: string, message: IBaseMessage){
        const trytesMessage = asciiToTrytes(JSON.stringify(message));
        const transfer = [{
            address: ''+address,
            message: trytesMessage,
            value: 0,
        }];
        return this.api.prepareTransfers(this.seed, transfer)
        .then((trytes: any) => this.api.sendTrytes(trytes, 2, this.minWeightMagnitude))
        .then((transections: any) => {
            console.log('message: ' + transections)
        })
        .catch((err: any) => {
            console.error(err)
        });
    }
    public getMessages(addr: string[]) {
        const query: any = {
            addresses: addr,
        };
        return this.api.findTransactions(query)
            .then((hashes: any) =>
                this.api.getTrytes(hashes)
                    .then(async (trytes: string[]) => {
                        return this.getMessagesFromTrytes(trytes) 
                    })
                    .catch((err: any) => console.log(err))
            ).catch((err: any) => console.log(err))
    }

    public sendContactRequest (address: string ){
        const message: IContactRequest = {
            mehtod: MessageMethod.ContactRequest,
            name: this.createChatName(),
        }
        
        return this.sendMessage(address, message)
    }  
    
    private async connectWithNode(){
        this.api = composeAPI({
            provider: this.provider
          })
        this.api.getNodeInfo((error: any, success: any) =>{
            if(error){
                console.error(error);
            }
        });  
    }

    private createChatName(){
        return 'dvincenz@FASKJNWODFNLASDM'
    }

    private getMessagesFromTrytes(trytes: string[]) {
        const messages: IMessageResponse[] = []
        trytes.forEach(
            (tryt: any) => {  
                const transaction = asTransactionObject(tryt)
                if(transaction.signatureMessageFragment.replace(/9+$/, '') === ''){
                    return;
                }
                const messageObject = this.parseMessage(trytesToAscii(transaction.signatureMessageFragment.replace(/9+$/, '')));
                if(messageObject === null ){
                    console.log('some messages dosent match to the given pattern')
                    return;
                }
                if(!messageObject.message){
                    return;
                }
                const message: IMessageResponse = {
                    address: transaction.address,
                    message: (messageObject as ITextMessage).message,
                    time: transaction.timestamp
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
