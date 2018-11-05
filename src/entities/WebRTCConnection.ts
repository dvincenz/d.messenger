import { Ice } from './Ice';
import { WebRtcClient } from 'src/services/webRTCService';

export class WebRtcConnection {
    public ices: Ice[];
    public status: WebRtcState;
    public connection: WebRtcClient;
}


export enum WebRtcState {
    connected,
    disconneted,
    iceSend
}

