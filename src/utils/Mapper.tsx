import { IBaseMessage, ITextMessage } from "../entities/interfaces";
import { Message, Contact, MessageStatus } from "../entities";

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

export function toContact(baseMessage: IBaseMessage): Contact {
    const contact: Contact = {
        address: baseMessage.address,
        name: '',
        myName: '',
        isActivated: true,
        secret: baseMessage.secret,

    }
    return contact
}

export function getRandomSeed(lenght: number = 81){                      
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9"; 
    const randomValues = new Uint32Array(length);       
    const result = new Array(length);             

    window.crypto.getRandomValues(randomValues);      

    let cursor = 0;                                   
    for (let i = 0; i < randomValues.length; i++) {   
        cursor += randomValues[i];                    
        result[i] = chars[cursor % chars.length];     
    }

    return result.join('');    
}