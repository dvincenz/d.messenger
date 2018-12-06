
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
    public host: string = 'https://nodes.devnet.thetangle.org' // 'https://nodes.devnet.iota.org' 
    public port: number = 443
    @observable public myAddress: string;
    public Iota: Iota;
    public newUser: boolean;
    public saveUserData: boolean = false;
    @observable private _myName: string;
    private _privateKey: string
    private _publicKey: string
    @observable private _seed: string;

    set seed(seed: string) {
        this.setKey('seed', seed)
        this._seed = seed;
    }
    get seed(){
        return this._seed;
    }

    set privateKey(key: string){
        window.sessionStorage.setItem('privatePGPEncripted', key)
        console.log('private PGP key, (encripted): ' + key)
        // todo an other place to save the key
        this._privateKey = key
    }
    get privateKey(){
        return this._privateKey
    }

    set publicKey(key: string){
        this.setKey('publicPGP', key)
        this._publicKey = key
    }
    get publicKey(){
        // todo search for key on the tangel if key is not set
        return this._publicKey
    }

    set myName(name: string) {
        this.setKey('myName', name)
        this._myName = name;
    }

    get myName(){
        return this._myName;
    }

    
    constructor(){
        this._seed = this.getKey('seed');
        this._myName = this.getKey('myName')
        this._privateKey = this.getKey('privatePGPEncripted')
        this._publicKey = this.getKey('publicPGP')
        this.ready = false;
    }

    public saveSeed (seed: string, storage: boolean){
        storage ? window.localStorage.setItem('seed', seed) : window.sessionStorage.setItem('seed', seed);
        this._seed = seed;
    }

    public dispose() {
        this._myName = undefined;
        this._seed = '';
        this.myAddress = undefined;
        this.Iota.dispose();
        messageStore.dispose();
        contactStore.dispose();
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

    private getKey(key: string){
        return window.localStorage.getItem(key) === null ? window.sessionStorage.getItem(key) : window.localStorage.getItem(key);
    }

    private setKey(key: string, value:string){
        if(this.saveUserData){
            window.localStorage.setItem(key, value);
            return
        }
        window.sessionStorage.setItem(key, value);
    }

}

export const settingStore = new SettingStore();

