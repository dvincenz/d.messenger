import { composeAPI  } from '@iota/core'
import { asciiToTrytes, trytesToAscii } from '@iota/converter'
import { asTransactionObject } from '@iota/transaction-converter'

/*iotaService wrapper is build as no react component -> todo move to best practise in ract*/ 

// tslint:disable-next-line:interface-over-type-literal
export type Message = {
    message: string,
    time: number,
    address: string,
}


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

    public sendMessage(message: string, address: string){
        const trytesMessage = asciiToTrytes(message);
        // const messageArray: string[] = [trytesMessage];
        const transfer = [{
            address: ''+address,
            message: trytesMessage,
            value: 0,
        }];
        this.api.prepareTransfers(this.seed, transfer)
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

    private getMessagesFromTrytes(trytes: string[]) {
        const messages: Message[] = []
        trytes.forEach(
            (tryt: any) => {
                
                const transaction = asTransactionObject(tryt)
                if(transaction.signatureMessageFragment.replace(/9+$/, '') === ''){
                    return;
                }
                const message: Message = {
                    address: transaction.address,
                    message: trytesToAscii(transaction.signatureMessageFragment.replace(/9+$/, '')),
                    time: transaction.timestamp
                }
                messages.push(message);
            }
            
        )
        return messages.sort((a, b) => a.time > b.time ? 1 : -1);
    }


}


