import { WebRtcClient } from "src/services/webRTCService";
import { ChatStatus } from "./WebRTCConnection";
import { IICERequest } from "src/services/iotaService/interfaces/IICERequest";
import { settingStore } from "src/stores/SettingStore";
import { IAddress } from "src/services/iotaService/interfaces/IAddress";

export class Contact {
    private _name: string;
    private _address: string;
    public isActivated?: boolean;
    public secret: string;
    // todo geter seter and make property private
    public webRtcClient?: WebRtcClient;
    public updateTime: number;
    public isDisplayed: boolean;
    public status: ChatStatus = ChatStatus.offline
    public isGroup: boolean;
    public publicKey: string;

    public get address () {return this._address;}
    public set address (value: string) {
        this._address = value  
        this.getPublicKey()
    }
    public get name () {return this._name;}
    public set name (value: string) {
        this._name = value  
        this.getPublicKey()
    }
    constructor(
            name: string, 
            address: string, 
            updateTime: number, 
            isDisplayed: boolean, 
            isActivated: boolean, 
            isGroup: boolean, 
            secret: string){
        this._address = address,
        this._name = name, 
        this.updateTime = updateTime,
        this.isDisplayed = isDisplayed,
        this.isGroup = isGroup,
        this.isActivated = isActivated
        this.secret = secret
        this.getPublicKey();
    }


    public setStatus(chatStatus: ChatStatus, iceReqeust?: IICERequest) {
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
                (this.webRtcClient.timestampIcePublic > iceReqeust.time ||
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

    private async getPublicKey(){
        if(this.publicKey === undefined && this.name !== undefined){
            const contact = (await settingStore.Iota.searchContactByName(this.name)).filter((c: IAddress) => c.myAddress === this.address)
            this.publicKey = contact.length > 0 ? (contact[0] as IAddress).publicKey : undefined
        }
    }

}


