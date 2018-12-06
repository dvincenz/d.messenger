import { IBaseMessage } from './IBaseMessage'

export interface IContactRequest extends IBaseMessage {
    address: string,
    senderAddress: string,
    name: string,
    isGroup: boolean,
    secret: string,
}