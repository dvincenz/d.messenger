
import { observable } from 'mobx'
import { Iota } from '../services/iotaService';
import { messageStore } from './MessageStore';
import { contactStore } from './ContactStore';


export enum ActiveDialog {
    AddContact,
    CreateGroup,
    InviteContact,
    Default,
}

export class SettingStore {
    // todo not fill with default values => store values in browser local storage

    public activeDialog: ActiveDialog = ActiveDialog.Default

    public host: string = 'https://nodes.devnet.iota.org' 
    public port: number = 443
    @observable public myAddress: string;
    public Iota: Iota;
    @observable private _myName: string;

    set seed(seed: string) {
        this._seed = seed;
    }

    get seed(){
        return this._seed;
    }

    set myName(name: string) {
        window.localStorage.setItem('myName', name)
        this._myName = name;
    }

    get myName(){
        return this._myName;
    }

    @observable private _seed: string = '' 
    constructor(){
        const sessionSeed = window.localStorage.getItem('seed') === null ? window.sessionStorage.getItem('seed') : window.localStorage.getItem('seed');
        if(sessionSeed !== null){
            this._seed = sessionSeed
            this._myName = window.localStorage.getItem('myName')
        }
    }

    public saveSeed (seed: string, storage: boolean){
        storage ? window.localStorage.setItem('seed', seed) : window.sessionStorage.setItem('seed', seed);
        this._seed = seed;
    }

    public async setupMessanger() {
        this.Iota = new Iota(this.host + ':' + this.port, this.seed);
        messageStore.subscribeForMessages();
        contactStore.subscribeForContactRequests();
        contactStore.subscribeForContactResponse();
        await this.Iota.bootstrapMessenger();
        contactStore.subscribeForIce(); // hotfix to not get old Ice messages
        this.myAddress = this.Iota.myAddress;
        console.log(this.myAddress)
    }
}

export const settingStore = new SettingStore();

