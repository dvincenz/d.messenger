import { WebRtcConnection } from "./WebRTCConnection";

export class Contact {
    public name:  string;
    public address: string;
    public myName: string;
    public isActivated?: boolean;
    public secret: string;
    public webRtcConnection?: WebRtcConnection;
    public updateTime: number;
    public isDisplayed: boolean;
    public isGroup: boolean;
}
