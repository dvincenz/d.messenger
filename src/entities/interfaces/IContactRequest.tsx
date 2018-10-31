import {IBaseMessage, Permission} from './IBaseMessage'

export interface IContactRequest extends IBaseMessage {
    level?: Permission,
    address: string,
    senderAddress: string,
    name: string,
}