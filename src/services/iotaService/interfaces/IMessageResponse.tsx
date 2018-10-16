import {IBaseMessage } from "./IBaseMessage";

export interface IMessageResponse extends IBaseMessage{
    message: string,
    time: number,
    address: string,
}