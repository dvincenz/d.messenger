import {IBaseMessage, RightsLevel} from './IBaseMessage'

export interface IContactRequest extends IBaseMessage {
    level?: RightsLevel,
}