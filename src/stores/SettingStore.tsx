
import { observable, computed } from 'mobx'
import { Iota } from '../services/iotaService';
import { messageStore } from './MessageStore';
import { contactStore } from './ContactStore';


export class SettingStore {
    // todo not fill with default values => store values in browser local storage
    
    public host: string = 'https://nodes.devnet.iota.org' 
    public port: number = 443
    @observable public myAddress: string;
    public Iota: Iota;
    public myName: string = '';

    set seed(seed: string){
        this._seed = seed;
        window.sessionStorage.setItem('seed', seed);
    }
    get seed(){
        return this._seed;
    }
    @observable private _seed: string = '' 
    constructor(){
        const sessionSeed = window.sessionStorage.getItem('seed')
        if(sessionSeed !== null){
            this._seed = sessionSeed
        }
    }
    public async setupMessanger() {
        this.Iota = new Iota(this.host + ':' + this.port, this.seed);
        messageStore.subscribeForMessages();
        contactStore.subscribeForContactRequests();
        contactStore.subscribeForContactResponse();
        await this.Iota.bootstrapMessenger();
        contactStore.subscribeForIce(); // hotfix to not get old Ice messages
        this.myAddress = this.Iota.myAddress;
        // todo save myMessages with event subscriber on iota service
        console.log(this.myAddress)
    }
}

export const settingStore = new SettingStore();

