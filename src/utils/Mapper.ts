import { ITextMessage, IContactRequest, IContactResponse, Permission } from "../services/iotaService/interfaces";
import { Message, Contact, MessageStatus } from "../entities";
import { IICERequest } from "src/services/iotaService/interfaces/IICERequest";
import { Ice } from "src/entities/Ice";
import { IContactParameters } from "src/entities/Contact";
import { settings } from "cluster";
import { SettingStore, settingStore } from "src/stores/SettingStore";

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
    const contactParameter: IContactParameters =
    {
        address,
        name: con.name,
        isActivated: (isGrp) || ((con as IContactResponse).level !== undefined && (con as IContactResponse).level === Permission.accepted),
        updateTime: con.time,
        isDisplayed: true,
        isGroup: isGrp,
        secret: con.secret,
        isMyRequest: con.senderAddress === settingStore.myAddress
    }
    const newContact =  new Contact (contactParameter);
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


 