import { observable } from "mobx";
import { ITextMessage, MessageMethod } from "./interfaces";
import { Contact } from "./Contact";

export class Message {
    public message: string 
    @observable public status?: MessageStatus = MessageStatus.New
    public hash?: string
    public time: number
    public contact: Contact

    public toITextMessage(): ITextMessage{
        const message: ITextMessage = {
            secret: this.contact.secret,
            address: this.contact.address,
            message: this.message,
            method:  MessageMethod.Message,
            time: new Date().getTime(),
        }
        return message
    }

}

export enum MessageStatus {
    Read,
    ReadyToSend,
    Sending,
    New,
}