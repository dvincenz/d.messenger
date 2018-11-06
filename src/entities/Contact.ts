import { WebRtcClient } from "src/services/webRTCService";
import { ChatStatus } from "./WebRTCConnection";

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
}
