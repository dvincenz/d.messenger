
export interface IBaseMessage {
    method: MessageMethod;
    address: string;
    hash?: string;
    time: number;
    secret: string;
}

export enum MessageMethod {
    ContactRequest,
    ContactResponse,
    Message,
}

export enum Permission {
    accepted,
    declined,
}