import {flow, observable} from "mobx";
import { Contact } from "../entities";
import {Iota} from "../services/iotaService";
import {settingStore} from "./SettingStore";
import {IBaseMessage, IContactRequest, IContactResponse, MessageMethod, Permission} from "../entities/interfaces";


export class ContactStore {
    @observable public contacts: Contact[] = [];
    @observable public state: ContactStoreState;

    public fetchContacts = flow(function *(this: ContactStore, address: string) {
        this.state = ContactStoreState.loading
        try {
            const messages = yield this.Iota.getMessages(address)
            messages.forEach((message: IBaseMessage) => {
                this.filterMessage(message)
            })
            this.state = ContactStoreState.updated
        } catch (error) {
            this.state = ContactStoreState.error
            console.log(error)
        }
    })

    private checkAcceptedStateOfContactRequest = flow(function *(this: ContactStore, contact: Contact) {
        try {
            const messages = yield this.Iota.getMessages(contact.address)
            messages.forEach((message: IBaseMessage) => {
                if(message.method === MessageMethod.ContactResponse) {
                    const msg = (message as IContactResponse)
                    if(msg.level === Permission.accepted) {
                        contact.state = true
                    }
                }
            })
        } catch (error) {
            this.state = ContactStoreState.error
            console.log(error)
        }
    })


    private Iota: Iota;

    constructor () {
        this.Iota = new Iota(settingStore.host + ':' + settingStore.port, settingStore.seed, 'IAXUZ9CFIZOIMMQGFUEMYEGPLFYDLBQWYKPMRAGZREMWSGSP9IJUSKBYOLK9DUCVXUDUCBNRPYDUQYLG9IZYKIX9Q9');
    }


    public addContact (contact: Contact) {
        this.contacts.push(contact)
        if(!contact.state) {
            this.checkAcceptedStateOfContactRequest(contact)
        }
    }

    private filterMessage(message: IBaseMessage) {
        switch (message.method) {
            case MessageMethod.ContactRequest: {
                const msg = (message as IContactRequest)
                const contact = {name: msg.name, address: msg.address, state: false}
                this.addContact(contact)
                break
            }
            case MessageMethod.ContactResponse: {
                const msg = (message as IContactResponse)
                if(msg.level) {
                    const contact = {name: msg.name, address: msg.address, state: true}
                    this.addContact(contact)
                }
                break
            }
        }
    }
}


export const contactStore = new ContactStore();

export enum ContactStoreState{
    loading,
    doPoW,
    updated,
    error,
}



// todo put following logic in contact store
// private async checkAcceptedStateOfContactRequests(contact: Contact, activeAddr: string) {
//     const addr: string[] = []
//     addr.push(contact.Address)

//     const messages = await this.getMessagesFromAddresses(addr)
//     messages.forEach(msg => {
//         if (msg.method === MessageMethod.ContactResponse) {
//             if (msg.address === activeAddr) {
//                 if (msg.level === Permission.accepted) {
//                     contact.State = true
//                 }
//             }
//         }
//     })
// }