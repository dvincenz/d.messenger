import { observable, computed } from 'mobx';
import { ITextMessage, IMessageResponse } from '../models/interfaces';
import { Message } from '../models/Message';


export class MessageStore {
    @observable public messages: Message[] = []
    @observable public name: string;
    @computed get getMessagesFromAddress () {
        return this.messages.filter(m => m.name === this.name);
    }
    public addMessage (messages: Message){
        this.messages.push(messages)
    }
}

export const messageStore = new MessageStore()
