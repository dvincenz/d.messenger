import { ITextMessage, IContactRequest, IContactResponse, Permission } from "../services/iotaService/interfaces";
import { Message, Contact, MessageStatus } from "../entities";

export function toMessage(baseMessage: ITextMessage): Message {
    const returnMessage: Message = {
        secret: baseMessage.secret,
        reciverAddress: baseMessage.address,
        message: baseMessage.message,
        hash: baseMessage.hash,
        status: MessageStatus.Read,
        time: baseMessage.time,
        toITextMessage:  Message.prototype.toITextMessage
    }
    return returnMessage;
}

export function toContact(con: IContactRequest | IContactResponse, address: string, isGrp: boolean): Contact {
    const contact: Contact = {
        address,
        name: con.name,
        myName: '',
        isActivated: (isGrp) || ((con as IContactResponse).level !== undefined && (con as IContactResponse).level === Permission.accepted),
        secret: con.secret,
        updateTime: con.time,
        isDisplayed: true,
        isGroup: isGrp,
    }
    return contact
}


 