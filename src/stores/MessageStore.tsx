import {observable, computed, flow} from 'mobx';
import {Message, MessageStatus} from '../entities/Message';
import {settingStore} from './SettingStore'
import {Contact} from '../entities';
import {toMessage} from '../utils/Mapper'
import {ITextMessage} from '../services/iotaService/interfaces';
import {contactStore} from './ContactStore';
import {ChatStatus} from 'src/entities/WebRTCConnection';

export class MessageStore {
    @computed get getMessagesFromAddress() {
        if (this.messages === undefined || this.messages.length === 0 || contactStore.currentContact === undefined) {
            return [] as Message []
        }
        if (contactStore.currentContact.isGroup) {
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
    public fetchMessages = flow(function* (this: MessageStore, address: string) {
        this.state = MessageStoreState.loading;
        try {
            yield settingStore.Iota.getMessages(address)
            const contact = contactStore.getContactByAddress(address)
            if (contact.webRtcClient === undefined && !contact.isGroup) {
                contact.setStatus(ChatStatus.online);
            }
            this.state = MessageStoreState.updated
        } catch (error) {
            this.state = MessageStoreState.error
        }
    })

    // todo find better way to fetch messages 
    public set setFitlerMessages(filterAddress: string) {
        this.fetchMessages(filterAddress);
    }

    public sendMessage = flow(function* (this: MessageStore, reciver: Contact, messageText: string) {
        if (messageText.trim().length > 0) {
            this.state = MessageStoreState.sending
            const msg: Message = {
                secret: reciver.secret,
                reciverAddress: reciver.address,
                message: messageText,
                time: parseInt(new Date().getTime().toString().substr(0, 10), 10),
                status: MessageStatus.Sending,
                toITextMessage: Message.prototype.toITextMessage // bad typescript hack
            }
            this.messages.push(msg);
            try {
                yield settingStore.Iota.sendMessage(msg.toITextMessage())
            } catch (error) {
                this.state = MessageStoreState.error
            }
        }
    })

    public subscribeForMessages = () => {
        settingStore.Iota.subscribe('message', (data: ITextMessage[]) => {
            if (data !== undefined) {
                this.addMessages(data)
            }

        })
    }

    public addMessage(messages: Message) {
        this.messages.push(messages)
    }

    public dispose() {
        this.messages = [];
    }

    private addMessages = (messages: ITextMessage[]) => {
        // could be a set, but its not that simple to implement it correctly
        const manuallyAddedMessages: Message[] =
            this.messages.filter(m => m.hash === undefined);

        messages.forEach((m: ITextMessage) => {
            if (manuallyAddedMessages.find(foundMsg => foundMsg.reciverAddress === m.address && foundMsg.message === m.message) === undefined) {
                this.messages.push(toMessage(m));
            }
        });
        this.messages = this.messages.slice().sort((a, b) => a.time - b.time); // sort messages by time
    }


}

export const messageStore = new MessageStore()

export enum MessageStoreState {
    loading,
    doPoW,
    sending,
    updated,
    error,
}