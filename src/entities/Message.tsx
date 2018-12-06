import { observable } from "mobx";
import { ITextMessage, MessageMethod } from "../services/iotaService/interfaces";
import { contactStore } from "src/stores/ContactStore";

export class Message {
    public message: string 
    public reciverAddress: string
    @observable public status?: MessageStatus = MessageStatus.New
    public hash?: string
    public time: number
    public secret: string

    public toITextMessage(isEncripted: boolean = true): ITextMessage{
        const message: ITextMessage = {
            secret: this.secret,
            address: contactStore.getContactBySecret(this.secret).address,
            message: this.message,
            method:  MessageMethod.Message,
            time: new Date().getTime(),
            isEncripted
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