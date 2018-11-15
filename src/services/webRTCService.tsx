import * as SimplePeer from 'simple-peer';
import { Contact } from 'src/entities';
import { IICERequest } from './iotaService/interfaces/IICERequest';
import { MessageMethod } from './iotaService/interfaces';
import { ChatStatus } from 'src/entities/WebRTCConnection';
import { settingStore } from 'src/stores/SettingStore';
 
export class WebRtcClient {
    public ice: string
    public peer: any;
    private contact: Contact
    constructor(contact: Contact, offer: boolean = true, ice?: string){
        this.contact = contact;
        this.peer = new SimplePeer({ initiator: offer, trickle: false })
        this.peer.on('close', this.errorHandling)
        this.peer.on('connect', this.connectionHandling)
        this.peer.on('data', this.reciveData)
        this.peer.on('signal', this.signalHandling)
        if(ice !== undefined){
            this.peer.signal(ice)
        }
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