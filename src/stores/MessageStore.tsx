import { observable, computed, flow, when } from 'mobx';
import { Message, MessageStatus } from '../models/Message';
import { settingStore } from './SettingStore'
import { Iota } from '../services/iotaService';

export class MessageStore {
    @computed get getMessagesFromAddress () {
        return this.messages.filter(m => m.address === this.address);
    }

    @observable public messages: Message[] = []
    @observable public name: string;
    @observable public state: MessageStoreState;
    @observable public address: string;
    public fetchMessages = flow(function * (this: MessageStore, address: string) {
        this.state = MessageStoreState.loading;
        try{
            console.log('filter by '  + this.address)
            const newMessages = yield this.Iota.getMessages(address)
            console.log(newMessages);
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
        }
        this.messages.push(msg);
        try {
            yield this.Iota.sendMessage(msg)
        } catch (error) {
            this.state = MessageStoreState.error
        }
    })

    private Iota: Iota;

    constructor () {
        this.Iota = new Iota(settingStore.host + ':' + settingStore.port, settingStore.seed);
        this.address = 'JJM9YJJUTGQGIIDOQHRI9BSOTRYXHJIRFLVKXJTQXPALGJTOSGQ9NKACLXHUGMSANYVLQGCDQIAZKNASDSFJEXTNMC'
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