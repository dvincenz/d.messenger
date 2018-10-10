import { IBaseMessage } from './IBaseMessage'
export interface IContactRequest extends IBaseMessage {
    level?: RightsLevel,
}

export enum RightsLevel {
    read,
    readAndWrite,
}