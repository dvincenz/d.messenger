import { flow, observable, computed } from "mobx";
import { Contact } from "../entities";
import { settingStore } from "./SettingStore";
import { IContactRequest, IContactResponse, Permission, MessageMethod } from "../services/iotaService/interfaces";
import { toContact, toIce } from "../utils/Mapper";
import { Ice } from "src/entities/Ice";
import { IICERequest } from "src/services/iotaService/interfaces/IICERequest";
import { WebRtcConnection, WebRtcState } from "src/entities/WebRTCConnection";
import { WebRtcClient } from "src/services/webRTCService";
import { stringify } from "querystring";


export class ContactStore {
    @computed get currentContact(): Contact {
        return this.contacts[this._currentContact];
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

    public subscribeForContactResponse () {
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

    public subscribeForIce () {
        settingStore.Iota.subscribe('ice', (ice: IICERequest[]) => {
            ice.forEach(i => {
                let newestIce: IICERequest
                // todo check if connection is obsolate
                const contact = this.getContactBySecret(i.secret)
                if(contact.updateTime < i.time && i.address === settingStore.myAddress){
                    newestIce = i
                }
                if(newestIce === undefined) {
                    return
                }
                const iceObject = JSON.parse(newestIce.iceObject)
                if(iceObject.type === 'offer'){
                    this.sendIce(false, iceObject)
                } else {
                    console.log('resiveAnswer')
                    this.contacts[this._currentContact].webRtcClient.peer.signal(JSON.stringify(iceObject))
                }
            }
        )}
    )}

    public sendIce(offer: boolean = true, ice?: any) {
        if(this.currentContact.webRtcConnection === undefined){
            this.contacts[this._currentContact].webRtcClient = new WebRtcClient(offer)
        }
        const webRtcClient =  this.contacts[this._currentContact].webRtcClient
    
        webRtcClient.peer.on('signal',(data: any) => {
            const iceReqeust: IICERequest = {
                address: this._currentContact,
                iceObject: JSON.stringify(data),
                method: MessageMethod.ICE,
                secret: this.currentContact.secret,
                time: new Date().getTime(),
            }
            console.log('signal')
            settingStore.Iota.sendIceRequest(iceReqeust)
        })
        webRtcClient.peer.on('connect', () => {
            console.log('webRTC connect')
            webRtcClient.peer.send('online ;)')
        })
        webRtcClient.peer.on('data', (data: any) => {
            console.log('data recived: ' + data);
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

