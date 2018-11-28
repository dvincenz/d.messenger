
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
    @observable public activeDialog: ActiveDialog = ActiveDialog.Default
    @observable public ready: boolean;
    public host: string = 'https://nodes.devnet.iota.org' 
    public port: number = 443
    @observable public myAddress: string;
    public Iota: Iota;
    public newUser: boolean
    @observable private _myName: string;
    private _privateKey: string
 

    set seed(seed: string) {
        this._seed = seed;
    }
    get seed(){
        return this._seed;
    }

    set privateKey(key: string){
        window.localStorage.setItem('privatePGPEncripted', key)
        console.log('private PGP key, (encripted): ' + key)
        // todo an other place to save the key
        this._privateKey = key
    }
    get privateKey(){
        return this._privateKey
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
        }
        this._myName = window.localStorage.getItem('myName')
        this._privateKey = window.localStorage.getItem('privatePGPEncripted')
        this.ready = false;
    }

    public saveSeed (seed: string, storage: boolean){
        storage ? window.localStorage.setItem('seed', seed) : window.sessionStorage.setItem('seed', seed);
        this._seed = seed;
    }

    public async setupMessanger() {
        this.ready = false;
        this.Iota = new Iota(this.host + ':' + this.port, this.seed);
        messageStore.subscribeForMessages();
        contactStore.subscribeForContactRequests();
        contactStore.subscribeForContactResponse();
        contactStore.subscribeForPublicKey();
        await this.Iota.bootstrapMessenger();
        contactStore.subscribeForIce(); // hotfix to not get old Ice messages
        this.myAddress = this.Iota.myAddress;
        if(this.newUser === true){
            contactStore.publishUser();
        }

        this.ready = true;
        console.log(this.myAddress)
    }

}

export const settingStore = new SettingStore();

