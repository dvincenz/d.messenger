
export interface IBaseMessage {
    method: MessageMethod;
    name: string;
    address: string;
    hash?: string;
    time: number;
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