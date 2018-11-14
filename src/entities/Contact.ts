import { WebRtcClient } from "src/services/webRTCService";
import { ChatStatus } from "./WebRTCConnection";
import { settingStore } from "src/stores/SettingStore";

export class Contact {
    public name:  string;
    public address: string;
    public myName: string;
    public isActivated?: boolean;
    public secret: string;
    public webRtcClient?: WebRtcClient;
    public updateTime: number;
    public isDisplayed: boolean;
    public status: ChatStatus = ChatStatus.offline
    public isGroup: boolean;

    public setStatus (chatStatus: ChatStatus, ice?: string) {
        if(this.webRtcClient !== undefined && this.address < settingStore.myAddress){
            // destroy webRtc Client of the lowest address if a offer arrives and a offer was already send => can easy happened because established over iota take some time.
            this.webRtcClient.peer.destroy();
            this.webRtcClient = undefined;
            this.webRtcClient = new WebRtcClient(this, false, ice)
            return
        }
        if(this.webRtcClient === undefined){
            this.webRtcClient = new WebRtcClient(this, ice === undefined, ice)
        }
    }

}


