import { observable } from "mobx";

export class Message {
    public message: string 
    @observable public status?: MessageStatus = MessageStatus.New
    public hash?: string
    public name: string
    public time: number
    public address: string

}

export enum MessageStatus {
    Read,
    ReadyToSend,
    Sending,
    New,
}