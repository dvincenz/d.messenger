import { WebRtcClient } from "src/services/webRTCService";
import { ChatStatus } from "./WebRTCConnection";
import { IICERequest } from "src/services/iotaService/interfaces/IICERequest";
import { settingStore } from "src/stores/SettingStore";
import { IPublicContact } from "src/services/iotaService/interfaces/IPublicContact";
import { observable } from "mobx";

export interface IContactParameters{
    name: string;
    address: string;
    updateTime: number; 
    isDisplayed: boolean;
    isMyRequest: boolean; 
    isActivated: boolean; 
    isGroup?: boolean;
    secret?: string;
    publicKey?: string;
}

export class Contact {
    private _name: string;
    private _address: string;
    private _publicKey: string;
    private _remoteStatus: ChatStatus;
    @observable public isActivated?: boolean;
    public isMyRequest: boolean;
    public secret: string;
    // todo geter seter and make property private
    public webRtcClient?: WebRtcClient;
    public updateTime: number;
    public isDisplayed: boolean;
    @observable public status: ChatStatus = ChatStatus.offline
    public isGroup: boolean;
    public get publicKey(){
        return this._publicKey;
    };

    public set publicKey(key: string){
        this._publicKey = key;
    }

    public get address () {return this._address;}
    public set address (value: string) {
        this._address = value  
    }
    public get name () {return this._name;}
    public set name (value: string) {
        this._name = value  
    }
    constructor(contact: IContactParameters){
        this._address = contact.address,
        this._name = contact.name, 
        this.updateTime = contact.updateTime,
        this.isDisplayed = contact.isDisplayed,
        this.isGroup = contact.isGroup,
        this.isActivated = contact.isActivated
        this.secret = contact.secret
        this._publicKey = contact.publicKey
        this.isMyRequest = contact.isMyRequest
    }

    public sendStatus(chatStatus: ChatStatus){
        if(this.status === ChatStatus.offline){
            return
        }
        try{
            if(this._remoteStatus !== chatStatus){
                this.webRtcClient.sendStatus(chatStatus);
                this._remoteStatus = chatStatus
            }
        }catch (ex){
            console.error('error setting status' + ex)
        }
    }

    public setStatus (chatStatus: ChatStatus){
        this.status = chatStatus

    }


    public getOnline(iceReqeust?: IICERequest) {
        // tslint:disable-next-line:no-unnecessary-initializer
        let ice = undefined
        try {
            if (iceReqeust !== undefined) {
                ice = iceReqeust.iceObject
                const iceObject = JSON.parse(ice)
                if(iceObject.type !== "offer"){
                    this.webRtcClient.signal(ice);
                    return;
                }
            }            
            if (this.webRtcClient !== undefined &&
                (this.webRtcClient.timestampIcePublic < iceReqeust.time ||
                    this.webRtcClient.timestampIcePublic === undefined ||
                    (this.webRtcClient.timestampIcePublic === iceReqeust.time && this.address > settingStore.myAddress)
                )
            ){
                this.webRtcClient.peer.destroy();
                this.webRtcClient = new WebRtcClient(this, false, ice)
                return
            }
            if (this.webRtcClient === undefined || this.webRtcClient.isClosed) {
                this.webRtcClient = new WebRtcClient(this, ice === undefined, ice)
            }
        } catch (error) {
            console.error(error)
        }
    }

    public async getPublicKey(){
        if(this._publicKey === undefined && this.name !== '' && this.isGroup === false){
            const contact = (await settingStore.Iota.searchContactByName(this.name)).filter((c: IPublicContact) => c.myAddress === this.address)
            this._publicKey = contact.length > 0 ? (contact[0] as IPublicContact).publicKey : undefined
            this.name =  contact.length > 0 ? (contact[0] as IPublicContact).name : this.name
        }
    }

}

export interface IContactParameters{
    name: string;
    address: string;
    updateTime: number; 
    isDisplayed: boolean;
    isMyRequest: boolean; 
    isActivated: boolean; 
    isGroup?: boolean;
    secret?: string;
    publicKey?: string;
}


