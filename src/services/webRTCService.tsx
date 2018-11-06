import * as SimplePeer from 'simple-peer';
 
export class WebRtcClient {
    public ice: string

    public peer: any;
    constructor(initiator: boolean){
        this.peer = new SimplePeer({ initiator, trickle: false })
    
        this.peer.on('close', this.errorHandling)
        
        // this.peer.on('connect', this.connected)
    }
    
    private errorHandling = (err: any) => {
        console.error(err);
    }




}