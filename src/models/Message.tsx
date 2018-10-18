import { observable } from "mobx";

export class Message {
    public message: string 
    @observable public status?: MessageStatus = MessageStatus.New
    public hash?: string
    public name: string
    public time: number

}

export enum MessageStatus {
    Read,
    ReadyToSend,
    Send,
    New,
}