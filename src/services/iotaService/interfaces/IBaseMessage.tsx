
export interface IBaseMessage {
    method: MessageMethod;
    address: string;
    hash?: string;
    time: number;
    isEncripted: boolean;
}

export enum MessageMethod {
    ContactRequest,
    ContactResponse,
    Message,
    ICE,
    AddressPublish
}

export enum Permission {
    accepted,
    denied,
}