import { Ice } from './Ice';
import { WebRtcClient } from 'src/services/webRTCService';

export class WebRtcConnection {
    public iceOffer?: Ice;
    public iceRespone?: Ice;
    public status: WebRtcState;
    public connection: WebRtcClient;
}


export enum WebRtcState {
    connected,
    disconneted,
    offerSend,
    responseSend,
}

