import { flow, observable, computed } from "mobx";
import { Contact } from "../entities";
import { settingStore } from "./SettingStore";
import { IContactRequest, IContactResponse, Permission } from "../services/iotaService/interfaces";
import { toContact } from "../utils/Mapper";
import { IICERequest } from "src/services/iotaService/interfaces/IICERequest";
import { getRandomSeed } from "src/utils";
import { IPublicContact } from "src/services/iotaService/interfaces/IPublicContact";
import { IContactParameters } from "src/entities/Contact";

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

    public addContactRequest = flow(function *(this: ContactStore, address: IPublicContact) {
        this.state = ContactStoreState.loading
        try {
            const secret = getRandomSeed(20)
            const contactParameters: IContactParameters = {
                name: address.name,
                address: address.myAddress,
                updateTime: address.time,
                isDisplayed: true,
                isActivated: false,
                isGroup: false,
                secret,
                publicKey: address.publicKey,
                isMyRequest: true,
            }
            this.contacts[address.myAddress] = new Contact(contactParameters);
            yield settingStore.Iota.sendContactRequest(address.myAddress, settingStore.myAddress, settingStore.myName, false, secret)
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

    public createGroup = flow(function *(this: ContactStore, name: string) {
        this.state = ContactStoreState.loading
        try {
            const groupAddr = getRandomSeed(81)
            yield settingStore.Iota.sendContactRequest(settingStore.myAddress, groupAddr, name, true)
            this.state = ContactStoreState.updated
        } catch (error) {
            this.state = ContactStoreState.error
            console.log(error)
        }
    })

    public inviteContact = flow(function *(this: ContactStore, address: string, groupAddr: string, groupName: string) {
        this.state = ContactStoreState.loading
        try {
            yield settingStore.Iota.sendContactRequest(address, groupAddr, groupName, true)
            this.state = ContactStoreState.updated
        } catch (error) {
            this.state = ContactStoreState.error
            console.log(error)
        }
    })

    @observable private contacts = {};
    // tslint:disable-next-line:variable-name
    @observable private _currentContact?: string;
    public async addOrUpdateContact (contact: IContactRequest | IContactResponse) {
        if(settingStore.myAddress !== contact.senderAddress ){
            if(this.contacts[contact.senderAddress] === undefined){
                this.contacts[contact.senderAddress] = await toContact(contact, contact.senderAddress, (contact as IContactRequest).isGroup === true);
                return
            }
            if (this.contacts[contact.senderAddress].updateTime < contact.time){
                this.UpdateContact(contact, contact.senderAddress);
                return
            }
        }
        if(settingStore.myAddress !== undefined && settingStore.myAddress !== contact.address){
            if(this.contacts[contact.address] === undefined){
                this.contacts[contact.address] = await toContact(contact, contact.address, (contact as IContactRequest).isGroup === true);
                return
            }
            if(this.contacts[contact.address].updateTime < contact.time){
                this.UpdateContact(contact, contact.address);
                return
            }
        }
    }

    private UpdateContact(contact: IContactRequest | IContactResponse, address: string) {
        this.contacts[address].isActivated = (contact as IContactResponse).level !== undefined && (contact as IContactResponse).level === Permission.accepted;
        this.contacts[address].UpdateTiem = contact.time;
        this.contacts[address].name = contact.name === undefined ? contact.name : this.contacts[address].name;
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

    public subscribeForContactRequests() {
        settingStore.Iota.subscribe('contactRequest', (contacts: IContactRequest[]) => {
            contacts.forEach(c => {
                this.addOrUpdateContact(c)
            })
        })
    }

    public subscribeForContactResponse() {
        settingStore.Iota.subscribe('contactResponse', (contacts: IContactResponse[]) => {
            contacts.forEach(c => {
                this.addOrUpdateContact(c)
            })
        })
    }

    public subscribeForIce() {
        settingStore.Iota.subscribe('ice', (ice: IICERequest[]) => {
            ice.forEach(i => {
                // todo check if connection is obsolate
                const contact = this.getContactBySecret(i.secret)
                if(contact === undefined)
                {
                    return
                }
                if (contact.updateTime <= i.time && i.address === settingStore.myAddress) {
                    contact.getOnline(i)
                }
            })
            
        })
    }

    public subscribeForPublicKey() {
        settingStore.Iota.subscribe('contact', (contacts: IPublicContact[]) => {
            contacts.forEach(c => {
                if (this.contacts[c.myAddress] !== undefined) {
                    this.contacts[c.myAddress].publicKey = c.publicKey
                }
            })
        })
    }

    public async publishUser() {
        await settingStore.Iota.publishMyPublicKey(settingStore.publicKey, settingStore.myName)
    }

    public dispose() {
        this.contacts = {};
        this._currentContact = '';
    }
}



export const contactStore = new ContactStore();

export enum ContactStoreState {
    loading,
    doPoW,
    updated,
    error,
}

