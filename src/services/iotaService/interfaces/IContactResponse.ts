import {IBaseMessage, Permission} from './IBaseMessage'

export interface IContactResponse extends IBaseMessage {
    level?: Permission,
    address: string,
    senderAddress: string,
    name: string,
    secret: string,
}