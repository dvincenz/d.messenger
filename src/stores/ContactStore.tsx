import {flow, observable} from "mobx";
import { Contact } from "../entities";
import {settingStore} from "./SettingStore";
import {IBaseMessage, IContactRequest, IContactResponse, MessageMethod, Permission} from "../services/iotaService/interfaces";
import { toContact } from "../utils/Mapper";


export class ContactStore {
    @observable public contacts: Contact[] = [];
    @observable public currentContact?: Contact;

    public set setCurrentContact (address: string) {
        this.currentContact = this.contacts.find(c => c.address === address)
    }

    public get getCurrentContact() {
        return this.currentContact;
    }

    

    @observable public state: ContactStoreState;

    public fetchContacts = flow(function *(this: ContactStore, address: string) {
        this.state = ContactStoreState.loading
        try {
            const contacts = yield settingStore.Iota.getContacts()
            contacts.forEach((contact: IBaseMessage) => {
                this.addContact(contact);
            })
            this.state = ContactStoreState.updated
        } catch (error) {
            this.state = ContactStoreState.error
            console.log(error)
        }
    })

    public addContactRequest(contact: Contact){
        // todo send contact request to the tangle.
        this.contacts.push(contact)
    }   

    private addContact(contact: IBaseMessage | IContactRequest | IContactResponse) {
        if(contact.method !== MessageMethod.ContactRequest && contact.method !== MessageMethod.ContactResponse){
            return;
        }
        if(contact.method === MessageMethod.ContactResponse && (contact as IContactResponse).level === Permission.accepted){
            this.updateContactStatus(contact as IContactResponse);
        }
        if(contact.method === MessageMethod.ContactRequest){
            if(this.contacts.find(c => c.secret === contact.secret) === undefined){
                this.contacts.push(toContact(contact));
            }
        }
    }

    private updateContactStatus (contact: IContactResponse){
        let isContactAviable = false;
        this.contacts.forEach(c => {
            if(contact.secret === c.secret){
                c.isActivated = true;
                isContactAviable = true;
            }
        })
        if(isContactAviable === false){
            this.contacts.push(toContact(contact));
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

