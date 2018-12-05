import { IBaseMessage } from "./IBaseMessage";

export interface IPublicContact extends IBaseMessage {
    publicKey: string,
    myAddress: string,
    name: string,
}