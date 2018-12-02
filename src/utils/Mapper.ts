import { ITextMessage, IContactRequest, IContactResponse, Permission } from "../services/iotaService/interfaces";
import { Message, Contact, MessageStatus } from "../entities";
import { IICERequest } from "src/services/iotaService/interfaces/IICERequest";
import { Ice } from "src/entities/Ice";
import { ChatStatus } from "src/entities/WebRTCConnection";
import { IAddress } from "src/services/iotaService/interfaces/IAddress";

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

export async function toContact(con: IContactRequest | IContactResponse, address: string, isGrp: boolean): Promise<Contact> {
    const newContact =  new Contact (
            con.name,    
            address, 
            con.time, 
            true,
            (isGrp) || ((con as IContactResponse).level !== undefined && (con as IContactResponse).level === Permission.accepted),
            isGrp,
            con.secret,
            )
    await newContact.getPublicKey();
    return newContact;
}


export function toIce(ice: IICERequest){
    const returnIce: Ice = {
        sdp: ice.iceObject,
        time: ice.time,
        type: 'offer'
    }
    return returnIce;
}


 