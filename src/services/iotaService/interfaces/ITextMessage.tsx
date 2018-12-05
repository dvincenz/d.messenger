import { IBaseMessage } from './';

export interface ITextMessage extends IBaseMessage{
    message: string;
    secret: string;
}