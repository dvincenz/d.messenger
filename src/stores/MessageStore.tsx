import { observable, computed, flow } from 'mobx';
import { Message } from '../models/Message';

export class MessageStore {
    @observable public messages: Message[] = []
    @observable public name: string;
    @observable public state: MessageStoreState;
    @computed get getMessagesFromAddress () {
        return this.messages.filter(m => m.name === this.name);
    }
    public addMessage (messages: Message){
        this.messages.push(messages)
    }

    // public fetchMessages = flow(function * () {
    //     this.state = MessageStoreState.sending;
    //     try{
    //         const messages = this.api
    //     } catch () {
    //         this.state = MessageStoreState.error
    //     }
    // })
}

export const messageStore = new MessageStore()

export enum MessageStoreState{
    loading,
    doPoW,
    sending,
    updated,
    error,
}