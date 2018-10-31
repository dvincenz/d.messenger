import { observable } from "mobx";
import { Contact } from "../entities";


export class ContactStore {
    @observable public contacts: Contact[] = [];
    @observable public currentContact?: Contact;

    public set setCurrentContact (address: string) {
        this.currentContact = this.contacts.find(c => c.address === address)
    }

    public get getCurrentContact() {
        return this.currentContact;
    }

    public addContact (contact: Contact) {
        this.contacts.push(contact)
    }
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


export const contactStore = new ContactStore();