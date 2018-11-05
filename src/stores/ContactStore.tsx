import { flow, observable, computed } from "mobx";
import { Contact } from "../entities";
import { settingStore } from "./SettingStore";
import { IContactRequest, IContactResponse, Permission } from "../services/iotaService/interfaces";
import { toContact } from "../utils/Mapper";


export class ContactStore {
    @computed get currentContact(): Contact {
        return this.contacts[this._currentContact]
    }
    set currentContact(contact: Contact) {
        this._currentContact = contact.address;
    }
    set setCurrentContact(address: string){
        this._currentContact = address;
    }
   
    @observable public state: ContactStoreState;
    @computed get getContacts (){
        const contactsArray = []
        // tslint:disable-next-line:forin
        for(const key in this.contacts){
            contactsArray.push(this.contacts[key])
        }
        return contactsArray
    }
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

    public rejectCurrentContact = flow(function *(this: ContactStore) {
        this.state = ContactStoreState.loading
        try {
            yield settingStore.Iota.sendContactResponse(
                this.currentContact !== undefined ? this.currentContact.address : '', 
                Permission.denied, 
                settingStore.myAddress, '',
                this.currentContact.secret )
            this.state = ContactStoreState.updated
        } catch (error) {
            this.state = ContactStoreState.error
            console.log(error)
        }
    })
    public acceptCurrentContact = flow(function *(this: ContactStore) {
        this.state = ContactStoreState.loading
        try {
            yield settingStore.Iota.sendContactResponse(
                this.currentContact !== undefined ? this.currentContact.address : '', 
                Permission.accepted, 
                settingStore.myAddress, 
                settingStore.myName, 
                this.currentContact.secret)
            this.currentContact.isActivated = true;
            this.state = ContactStoreState.updated
        } catch (error) {
            this.state = ContactStoreState.error
            console.log(error)
        }
    })
    @observable private contacts = {};
    // tslint:disable-next-line:variable-name
    @observable private _currentContact?: string;

    public addContact (contact: Contact) {
        this.contacts[contact.address] = contact;
    }
    public getContactBySecret(secret:string): Contact{
        for(const key in this.contacts){
            if(this.contacts[key].secret === secret){
                return this.contacts[key]
            }
        }
        return undefined
    }

    public getContactByAddress (address: string): Contact {
        return this.contacts[address]
    }

    public subscribeForContactRequests () {
        settingStore.Iota.subscribe('contactRequest', (contacts: IContactRequest[]) => {
            contacts.forEach(c => {
                if(this.contacts[c.senderAddress] === undefined && settingStore.myAddress !== c.senderAddress){
                    this.contacts[c.senderAddress] = toContact(c, c.senderAddress)
                }
                if(this.contacts[c.address] === undefined && settingStore.myAddress !== c.address && settingStore.myAddress !== undefined){
                    this.contacts[c.address] = toContact(c, c.address)
                }
            })
        })
    }

    public subscribeForeContactResponse () {
        settingStore.Iota.subscribe('contactResponse', (contacts: IContactResponse[]) => {
            contacts.forEach(c => {
                if(this.contacts[c.senderAddress] === undefined || (this.contacts[c.senderAddress] !== undefined && this.contacts[c.senderAddress].updateTime < c.time)){
                    if(settingStore.myAddress !== c.senderAddress){
                        this.contacts[c.senderAddress] = toContact(c, c.senderAddress)
                    }
                }
                if(this.contacts[c.address] === undefined || (this.contacts[c.address] !== undefined && this.contacts[c.address].updateTime < c.time)){
                    if(settingStore.myAddress !== c.address && settingStore.myAddress !== undefined){
                        this.contacts[c.address] = toContact(c, c.address)
                    }
                }
            })
        })
    }
}


export const contactStore = new ContactStore();

export enum ContactStoreState {
    loading,
    doPoW,
    updated,
    error,
}

