import { flow, observable, computed } from "mobx";
import { Contact } from "../entities";
import { settingStore } from "./SettingStore";
import { IContactRequest, IContactResponse, Permission, MessageMethod } from "../services/iotaService/interfaces";
import { toContact } from "../utils/Mapper";
import { IICERequest } from "src/services/iotaService/interfaces/IICERequest";
import { WebRtcClient } from "src/services/webRTCService";
import { ChatStatus } from "src/entities/WebRTCConnection";
import { getRandomSeed } from "src/utils";

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
            yield settingStore.Iota.sendContactRequest(address, settingStore.myAddress, 'dvi', false)
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
                    this.contacts[c.senderAddress] = toContact(c, c.senderAddress, c.isGroup)
                }
                if(this.contacts[c.address] === undefined && settingStore.myAddress !== c.address && settingStore.myAddress !== undefined){
                    this.contacts[c.address] = toContact(c, c.address, c.isGroup)
                }
            })
        })
    }

    public subscribeForContactResponse () {
        settingStore.Iota.subscribe('contactResponse', (contacts: IContactResponse[]) => {
            contacts.forEach(c => {
                if(this.contacts[c.senderAddress] === undefined || (this.contacts[c.senderAddress] !== undefined && this.contacts[c.senderAddress].updateTime < c.time)){
                    if(settingStore.myAddress !== c.senderAddress){
                        this.contacts[c.senderAddress] = toContact(c, c.senderAddress, false)
                    }
                }
                if(this.contacts[c.address] === undefined || (this.contacts[c.address] !== undefined && this.contacts[c.address].updateTime < c.time)){
                    if(settingStore.myAddress !== c.address && settingStore.myAddress !== undefined){
                        this.contacts[c.address] = toContact(c, c.address, false)
                    }
                }
            })
        })
    }

    public subscribeForIce() {
        settingStore.Iota.subscribe('ice', (ice: IICERequest[]) => {
            ice.forEach(i => {
                let newestIce: IICERequest
                // todo check if connection is obsolate
                const contact = this.getContactBySecret(i.secret)
                if (contact.updateTime < i.time && i.address === settingStore.myAddress) {
                    newestIce = i
                }
                if (newestIce === undefined) {
                    return
                }
                const iceObject = JSON.parse(newestIce.iceObject)
                if (iceObject.type === 'offer') {
                    if(contact.webRtcClient !== undefined && contact.address < settingStore.myAddress){
                        // destroy webRtc Client of the lowest address if a offer arrives and a offer was already send => can easy happened because established over iota take some time.
                        contact.webRtcClient.peer.destroy();
                        contact.webRtcClient = undefined;
                        this.sendIce(contact, false, iceObject)
                    }
                    if(contact.webRtcClient === undefined){
                        this.sendIce(contact, false, iceObject)
                    }
                } else {
                    this.getContactBySecret(i.secret).webRtcClient.peer.signal(JSON.stringify(iceObject))
                }
            }
            )
        }
        )
    }

    public sendIce(contact: Contact, offer: boolean = true, ice?: any) {
        if(contact.webRtcClient === undefined){
            contact.webRtcClient = new WebRtcClient(offer)
        }
        const webRtcClient = contact.webRtcClient
    
        webRtcClient.peer.on('signal',(data: any) => {
            const iceReqeust: IICERequest = {
                address: contact.address,
                iceObject: JSON.stringify(data),
                method: MessageMethod.ICE,
                secret: contact.secret,
                time: new Date().getTime(),
            }
            settingStore.Iota.sendIceRequest(iceReqeust)
        })
        webRtcClient.peer.on('connect', () => {
            webRtcClient.peer.send(JSON.stringify({status: ChatStatus.online}))
        })
        webRtcClient.peer.on('data', (data: any) => {
            const dataObject = JSON.parse(data)
            if(dataObject !== undefined && dataObject.status !== undefined){
                contact.status = dataObject.status
            }
        })
        if(ice !== undefined){
            webRtcClient.peer.signal(JSON.stringify(ice))
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

