import { flow, observable, computed } from "mobx";
import { Contact } from "../entities";
import { settingStore } from "./SettingStore";
import { IContactRequest, IContactResponse, Permission, MessageMethod } from "../services/iotaService/interfaces";
import { toContact } from "../utils/Mapper";
import { IICERequest } from "src/services/iotaService/interfaces/IICERequest";
import { getRandomSeed } from "src/utils";
import { ChatStatus } from "src/entities/WebRTCConnection";
import { EncriptionService } from "src/services/encriptionService";
import { settings } from "cluster";

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
            yield settingStore.Iota.sendContactRequest(address, settingStore.myAddress, settingStore.myName, false)
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



    public addContact (contact: IContactRequest | IContactResponse) {
        if(settingStore.myAddress !== contact.senderAddress){
            if(this.contacts[contact.senderAddress] === undefined || this.contacts[contact.senderAddress].updateTime < contact.time){
                this.contacts[contact.senderAddress] = toContact(contact, contact.senderAddress, (contact as IContactRequest).isGroup === true);
            }
        }
        if(settingStore.myAddress !== undefined && settingStore.myAddress !== contact.address){
            if(this.contacts[contact.address] === undefined || this.contacts[contact.address].updateTime < contact.time){
                const currentName = this.contacts[contact.address].name
                this.contacts[contact.address] = toContact(contact, contact.address, (contact as IContactRequest).isGroup === true);
                this.contacts[contact.address].name = currentName !== undefined ? currentName : this.contacts[contact.address].name
            }
        }
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
                this.addContact(c)
            })
        })
    }

    public subscribeForContactResponse() {
        settingStore.Iota.subscribe('contactResponse', (contacts: IContactResponse[]) => {
            contacts.forEach(c => {
                this.addContact(c)
            })
        })
    }

    public subscribeForIce() {
        settingStore.Iota.subscribe('ice', (ice: IICERequest[]) => {
            ice.forEach(i => {
                // let newestIce: IICERequest
                // todo check if connection is obsolate
                const contact = this.getContactBySecret(i.secret)
                if(contact === undefined)
                {
                    return
                }
                if (contact.updateTime < i.time && i.address === settingStore.myAddress) {
                    contact.setStatus(ChatStatus.online, i)
                }
            })
            
        })
    }

    public async publishUser() {
        const keys = await EncriptionService.createKey(settingStore.myName, settingStore.seed)
        settingStore.privateKey = keys.privateKey
        await settingStore.Iota.publishMyPublicKey(keys.publicKey, settingStore.myName)
    }
}



export const contactStore = new ContactStore();

export enum ContactStoreState {
    loading,
    doPoW,
    updated,
    error,
}

