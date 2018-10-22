import {IBaseMessage, Permission} from './IBaseMessage'

export interface IContactResponse extends IBaseMessage {
    level?: Permission,
    address: string,
}