import { IBaseMessage, ITextMessage, IContactRequest, IContactResponse } from "../services/iotaService/interfaces";
import { Message, Contact, MessageStatus } from "../entities";
import { contactStore } from "src/stores/ContactStore";

export function toMessage(baseMessage: ITextMessage): Message {
    const returnMessage: Message = {
        contact: contactStore.contacts.find(c => c.secret === baseMessage.secret),
        message: baseMessage.message,
        hash: baseMessage.hash,
        status: MessageStatus.Read,
        time: baseMessage.time,
        toITextMessage:  Message.prototype.toITextMessage
    }
    return returnMessage;
}

export function toContact(con: IContactRequest | IContactResponse): Contact {
    const contact: Contact = {
        address: con.senderAddress,
        name: con.name,
        myName: '',
        isActivated: true,
        secret: con.secret,

    }
    return contact
}


