import { observable } from "mobx";
import { ITextMessage, MessageMethod } from "./interfaces";

export class Message {
    public message: string 
    @observable public status?: MessageStatus = MessageStatus.New
    public hash?: string
    public name: string
    public time: number
    public address: string

    public toITextMessage(): ITextMessage{
        const message: ITextMessage = {
            address: this.address,
            message: this.message,
            method:  MessageMethod.Message,
            name: this.name,
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