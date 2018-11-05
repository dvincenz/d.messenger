import {IBaseMessage, Permission} from './IBaseMessage'

export interface IICERequest extends IBaseMessage {
    iceObject: string;
}