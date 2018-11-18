import { WebRtcClient } from "src/services/webRTCService";
import { ChatStatus } from "./WebRTCConnection";
import { IICERequest } from "src/services/iotaService/interfaces/IICERequest";
import { settingStore } from "src/stores/SettingStore";

export class Contact {
    public name: string;
    public address: string;
    public isActivated?: boolean;
    public secret: string;
    // todo geter seter and make property private
    public webRtcClient?: WebRtcClient;
    public updateTime: number;
    public isDisplayed: boolean;
    public status: ChatStatus = ChatStatus.offline
    public isGroup: boolean;

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

}


