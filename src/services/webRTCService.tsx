import * as SimplePeer from 'simple-peer';
 
export class WebRtcClient {
    public ice: string

    private peer = new SimplePeer({ initiator: location.hash === '#1', trickle: false })
    
    constructor(){
        this.peer.on('close', this.errorHandling)
        this.peer.on('data', this.dataResiver)
        this.peer.on('signal', this.signalHandling)
        this.peer.on('connect', this.connected)
    }

    public sendIce(ice: string){
        console.log(ice);
        this.peer.signal(ice);
    }
    
    private errorHandling = (err: any) => {
        console.error(err);
    }

    
    private signalHandling = (data: any) => {
        console.log(data)
        this.ice = data;
    }


    private dataResiver = (data: any) => {
        console.log('recived data ' + data);
    }

    private connected = () => {
        console.log('connected');
        const randomValue = 'fancy-' + Math.random()
        this.peer.send(randomValue);
    }

}