import { IBaseMessage } from './IBaseMessage'

export interface IICERequest extends IBaseMessage {
    iceObject: string;
    secret: string;
}