import { IBaseMessage } from "./IBaseMessage";

export interface IAddress extends IBaseMessage {
    publicKey: string,
    myAddress: string,
    tag: string,
}