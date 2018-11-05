import { ITextMessage, IContactRequest, IContactResponse, Permission } from "../services/iotaService/interfaces";
import { Message, Contact, MessageStatus } from "../entities";
import { IICERequest } from "src/services/iotaService/interfaces/IICERequest";
import { Ice } from "src/entities/Ice";

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

export function toContact(con: IContactRequest | IContactResponse, address: string): Contact {
    const contact: Contact = {
        address,
        name: con.name,
        myName: '',
        isActivated: (con as IContactResponse).level !== undefined && (con as IContactResponse).level === Permission.accepted,
        secret: con.secret,
        updateTime: con.time,
        isDisplayed: true,
    }
    return contact

}

export function toIce(ice: IICERequest){
    const returnIce: Ice = {
        sdp: ice.iceObject,
        time: ice.time,
        type: 'offer'
    }
    return returnIce;
}


 