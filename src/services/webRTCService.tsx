import * as SimplePeer from 'simple-peer';
import { Contact } from 'src/entities';
import { IICERequest } from './iotaService/interfaces/IICERequest';
import { MessageMethod } from './iotaService/interfaces';
import { ChatStatus } from 'src/entities/WebRTCConnection';
import { settingStore } from 'src/stores/SettingStore';
 
export class WebRtcClient {
    public ice: string
    public peer: any;
    public timestampIcePublic: number;
    public isClosed: boolean;
    private contact: Contact
    constructor(contact: Contact, offer: boolean = true, ice?: string){
         // todo remove if connection establishment never fails. Need some more troubleshooting because connection initiation under some circumstances fails
        console.log('create webRtcObject, initator: ' + offer)
        this.contact = contact;
        this.peer = new SimplePeer({ initiator: offer, trickle: false })
        this.peer.on('error', this.errorHandling)
        this.peer.on('close', this.onClose)
        this.peer.on('connect', this.connectionHandling)
        this.peer.on('data', this.reciveData)
        this.peer.on('signal', this.signalHandling)
        if(ice !== undefined){
            this.peer.signal(ice)
        }
    }

    public async signal (ice: string){
        await this.peer.signal(ice)
    }

    private signalHandling = async (data: any) => {
        const iceReqeust: IICERequest = {
            address: this.contact.address,
            iceObject: JSON.stringify(data),
            method: MessageMethod.ICE,
            secret: this.contact.secret,
            time: new Date().getTime(),
        }
         // todo remove if connection establishment never fails. Need some more troubleshooting because connection initiation under some circumstances fails
        console.log('send ice on tangle' + iceReqeust.iceObject)
        this.timestampIcePublic = await settingStore.Iota.sendIceRequest(iceReqeust)
    
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
        this.isClosed = true;
        console.error(err);
    }

    private onClose = () => {
        this.isClosed = true;
        this.contact.status = ChatStatus.offline
    }


}