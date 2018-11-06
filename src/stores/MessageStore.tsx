import { observable, computed, flow } from 'mobx';
import { Message, MessageStatus } from '../entities/Message';
import { settingStore } from './SettingStore'
import { Contact } from '../entities';
import { toMessage } from '../utils/Mapper'
import { ITextMessage } from '../services/iotaService/interfaces';
import { contactStore } from './ContactStore';

export class MessageStore {
    @computed get getMessagesFromAddress () {
        if(this.messages === undefined || this.messages.length === 0 || contactStore.currentContact === undefined){
            return [] as Message []
        }
        if(contactStore.currentContact.isGroup) {
            return this.messages.filter(m => {
                return m.reciverAddress === contactStore.currentContact.address
            })
        } else {
            return this.messages.filter(m => {
                return m.secret === contactStore.currentContact.secret
            })
        }
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
            secret: reciver.secret,
            reciverAddress: reciver.address,
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

    public subscribeForMessages = () =>{
        settingStore.Iota.subscribe('message', (data: ITextMessage[]) => 
        {
            if(data !== undefined){
                this.addMessages(data)
            }
            
        })
    }
    public addMessage (messages: Message){
        this.messages.push(messages)
    }

    private addMessages = (messages: ITextMessage[]) => {
        messages.forEach(m => this.messages.push(toMessage(m)))
        this.messages = this.messages.slice().sort((a, b) => a.time > b.time ? 1 : -1); // sort messages by time
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