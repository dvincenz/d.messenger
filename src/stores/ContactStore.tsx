import { observable } from "mobx";
import { Contact } from "../models";


export class ContactStore {
    @observable public contacts: Contact[] = [];
    
    public addContact (contact: Contact) {
        this.contacts.push(contact)
    }
}

 


export const contactStore = new ContactStore();