
export interface IBaseMessage {
    method: MessageMethod;
    name: string;
}

export enum MessageMethod {
    ContactRequest,
    ContactResponse,
    Message,
}