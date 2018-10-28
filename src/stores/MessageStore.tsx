import { observable, computed, flow, when } from 'mobx';
import { Message, MessageStatus } from '../entities/Message';
import { settingStore } from './SettingStore'
import { Iota } from '../services/iotaService';

export class MessageStore {
    @computed get getMessagesFromAddress () {
        this.messages.forEach((m: Message) => console.log("filter: " + m.address +
          " and "+ this.address.substring(0,81))) 
        const rmessages = this.messages.filter(m => m.address === this.address.substring(0,81))
        console.log('number of maches: ' + rmessages.length)
        return rmessages
    }

    @observable public messages: Message[] = []
    public name: string;
    @observable public state: MessageStoreState;
    public address: string;
    public fetchMessages = flow(function * (this: MessageStore, address: string) {
        this.state = MessageStoreState.loading;
        try{
            const newMessages = yield this.Iota.getMessages(address)
            this.messages = newMessages;
            this.state = MessageStoreState.updated
        } catch (error) {
            this.state = MessageStoreState.error
        }
    })
    public set setFitlerMessages (filterAddress: string) {
        this.fetchMessages(filterAddress);
        this.address = filterAddress;
    }
    public sendMessage = flow(function* (this: MessageStore, addr: string, messageText: string) {
        this.state = MessageStoreState.sending
        const msg: Message = {
            address: addr,
            message: messageText,
            name: this.name,
            time: new Date().getTime(),
            status: MessageStatus.Sending,
            toITextMessage: Message.prototype.toITextMessage // bad typescript hack
        }
        this.messages.push(msg);
        try {
            yield this.Iota.sendMessage(msg.toITextMessage())
        } catch (error) {
            this.state = MessageStoreState.error
        }
    })

    private Iota: Iota;

    constructor () {
        this.Iota = new Iota(settingStore.host + ':' + settingStore.port, settingStore.seed, 'IAXUZ9CFIZOIMMQGFUEMYEGPLFYDLBQWYKPMRAGZREMWSGSP9IJUSKBYOLK9DUCVXUDUCBNRPYDUQYLG9IZYKIX9Q9');
    }
    public addMessage (messages: Message){
        this.messages.push(messages)
    }
}

export const messageStore = new MessageStore()

export enum MessageStoreState{
    loading,
    doPoW,
    sending,
    updated,
    error,
}