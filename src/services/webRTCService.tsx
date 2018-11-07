import * as SimplePeer from 'simple-peer';
import { Contact } from 'src/entities';
import { IICERequest } from './iotaService/interfaces/IICERequest';
import { MessageMethod } from './iotaService/interfaces';
import { ChatStatus } from 'src/entities/WebRTCConnection';
 
export class WebRtcClient {
    public ice: string
    public peer: any;
    private contact: Contact
    constructor(contact: Contact, offer: boolean = true, ice?: any){
        this.contact = contact;
        this.peer = new SimplePeer({ initiator: offer, trickle: false })
    
        this.peer.on('close', this.errorHandling)
        this.peer.on('connect', this.connectionHandling)
        this.peer.on('data', this.reciveData)
        this.peer.on('signal', this.signalHandling)
    }


    public async sendIce() {

        const webRtcClient = contact.webRtcClient
        if(ice !== undefined){
            webRtcClient.peer.signal(JSON.stringify(ice))
        }
    
        webRtcClient.peer.on('signal',(data: any) => {
            const iceReqeust: IICERequest = {
                address: contact.address,
                iceObject: JSON.stringify(data),
                method: MessageMethod.ICE,
                secret: contact.secret,
                time: new Date().getTime(),
            }
            settingStore.Iota.sendIceRequest(iceReqeust)
        })
    }

    private signalHandling = (data: any) => {
        const iceReqeust: IICERequest = {
            address: this.contact.address,
            iceObject: JSON.stringify(data),
            method: MessageMethod.ICE,
            secret: this.contact.secret,
            time: new Date().getTime(),
        }
        settingStore.Iota.sendIceRequest(iceReqeust)
    
    }

    private reciveData = (data: any) => {
        const dataObject = JSON.parse(data)
        if(dataObject !== undefined && dataObject.status !== undefined){
            this.contact.status = dataObject.status
        }
    }

    private connectionHandling = () => {
        this.peer.send(JSON.stringify({status: ChatStatus.online}))
    }
    
    private errorHandling = (err: any) => {
        console.error(err);
    }




}