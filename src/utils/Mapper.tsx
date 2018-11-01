import { IBaseMessage, ITextMessage, IContactRequest, IContactResponse } from "../entities/interfaces";
import { Message, Contact, MessageStatus } from "../entities";
import {IGroupInvitation} from "../entities/interfaces/IGroupInvitation";
import {Group} from "../entities/Group";

export function toMessage(baseMessage: ITextMessage): Message {
    const returnMessage: Message = {
        contact: toContact(baseMessage),
        message: baseMessage.message,
        hash: baseMessage.hash,
        status: MessageStatus.Read,
        time: baseMessage.time,
        toITextMessage:  Message.prototype.toITextMessage
    }
    return returnMessage;
}

export function toContact(baseMessage: IBaseMessage | IContactRequest | IContactResponse): Contact {
    const contact: Contact = {
        address: baseMessage.address,
        name: '',
        myName: '',
        isActivated: true,
        secret: baseMessage.secret,

    }
    return contact
}

export function toGroup(baseMessage: IGroupInvitation) : Group {
    const group: Group = {
        name: baseMessage.groupName,
        address: baseMessage.groupAddress,
    }
    return group
}


