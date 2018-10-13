
export interface IBaseMessage {
    mehtod: MessageMethod;
    name: string;
}

export enum MessageMethod {
    ContactRequest,
    ContactResponse,
    Message,
}