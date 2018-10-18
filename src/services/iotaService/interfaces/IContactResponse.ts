import {IBaseMessage, RightsLevel} from './IBaseMessage'

export interface IContactResponse extends IBaseMessage {
    level?: RightsLevel,
}