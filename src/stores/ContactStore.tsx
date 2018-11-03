import { flow, observable } from "mobx";
import { Contact } from "../entities";
import { settingStore } from "./SettingStore";
import { IBaseMessage, IContactRequest, IContactResponse, MessageMethod, Permission } from "../services/iotaService/interfaces";
import { toContact } from "../utils/Mapper";


export class ContactStore {

    public set setCurrentContact(address: string) {
        this.currentContact = this.contacts.find(c => c.address === address)
    }

    public get getCurrentContact() {
        return this.currentContact;
    }
    @observable public contacts: Contact[] = [];
    @observable public currentContact?: Contact;
    @observable public state: ContactStoreState;

    public addContactRequest = flow(function *(this: ContactStore, address: string) {
        this.state = ContactStoreState.loading
        try {
            yield settingStore.Iota.sendContactRequest(address, settingStore.myAddress, 'dvi')
            this.state = ContactStoreState.updated
        } catch (error) {
            this.state = ContactStoreState.error
            console.log(error)
        }
    })

    public subscribeForContactRequests () {
        settingStore.Iota.subscribe('contactRequest', (contacts: IContactRequest[]) => {
            contacts.forEach(c => {this.addContact(c)})
        })
    }

    public subscribeForeContactResponse () {
        settingStore.Iota.subscribe('contactResponse', (contacts: IContactRequest[]) => {
            contacts.forEach(c => {this.addContact(c)})
        })
    }

    public addContact(contact: IBaseMessage | IContactRequest | IContactResponse) {
        if (contact.method !== MessageMethod.ContactRequest && contact.method !== MessageMethod.ContactResponse) {
            return;
        }
        if (contact.method === MessageMethod.ContactResponse && (contact as IContactResponse).level === Permission.accepted) {
            this.updateContactStatus(contact as IContactResponse);
        }
        if (contact.method === MessageMethod.ContactRequest) {
            if (this.contacts.find(c => c.secret === contact.secret) === undefined) {
                this.contacts.push(toContact(contact as IContactRequest));
            }
        }
    }

    private updateContactStatus(contact: IContactResponse) {
        let isContactAviable = false;
        this.contacts.forEach(c => {
            if (contact.secret === c.secret) {
                c.isActivated = true;
                isContactAviable = true;
            }
        })
        if (isContactAviable === false) {
            this.contacts.push(toContact(contact));
        }
    }
}


export const contactStore = new ContactStore();

export enum ContactStoreState {
    loading,
    doPoW,
    updated,
    error,
}

