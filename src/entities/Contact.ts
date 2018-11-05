import { WebRtcClient } from "src/services/webRTCService";

export class Contact {
    public name:  string;
    public address: string;
    public myName: string;
    public isActivated?: boolean;
    public secret: string;
    public webRtcConnection?: WebRtcClient;
    public updateTime: number;
    public isDisplayed: boolean;
}
