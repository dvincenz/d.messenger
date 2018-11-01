import { observable, computed, flow } from 'mobx';
import { Message, MessageStatus } from '../entities/Message';
import { settingStore } from './SettingStore'
import { Contact } from '../entities';
import { toMessage } from '../utils/Mapper'
import { ITextMessage } from '../entities/interfaces';
import { contactStore } from './ContactStore';

export class MessageStore {
    @computed get getMessagesFromAddress () {
        if(this.messages === undefined || this.messages.length === 0 || typeof contactStore.currentContact === undefined){
            return [] as Message []
        }
        return this.messages.filter(m => m.contact.secret === contactStore.currentContact.secret)
    }

    @observable public messages: Message[] = []
    @observable public state: MessageStoreState;
    public fetchMessages = flow(function * (this: MessageStore, address: string) {
        this.state = MessageStoreState.loading;
        try{
            const newMessages = yield settingStore.Iota.getMessages(address)
            if(newMessages === undefined){
                return;
            }
            this.messages = newMessages.map((m: ITextMessage) => {
                return toMessage(m);
            });
            this.state = MessageStoreState.updated
        } catch (error) {
            this.state = MessageStoreState.error
        }
    })

    // todo find better way to fetch messages 
    public set setFitlerMessages (filterAddress: string) {
        this.fetchMessages(filterAddress);
    }
    public sendMessage = flow(function* (this: MessageStore, reciver: Contact, messageText: string) {
        this.state = MessageStoreState.sending
        const msg: Message = {
            contact: reciver,
            message: messageText,
            time: new Date().getTime(),
            status: MessageStatus.Sending,
            toITextMessage: Message.prototype.toITextMessage // bad typescript hack
        }
        this.messages.push(msg);
        try {
            yield settingStore.Iota.sendMessage(msg.toITextMessage())
        } catch (error) {
            this.state = MessageStoreState.error
        }
    })

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