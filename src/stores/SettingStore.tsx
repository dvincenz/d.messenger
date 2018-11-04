
import { observable } from 'mobx'
import { Iota } from '../services/iotaService';
import { messageStore } from './MessageStore';
import { contactStore } from './ContactStore';
export class SettingStore {
    // todo not fill with default values => store values in browser local storage
    @observable public seed: string = '' // 'AUZHTFWRCCJY9INBKOECSIVCUORQIJWXPJHIRQZBRNHTEVXPGLFNOXLVEMEBWAXAOKUFNOCYNKTRGFSUA'
    public host: string = 'http://13.93.79.127'
    public port: number = 14267
    public myAddress: string;
    public Iota: Iota;
    public myName: string = '';

    public setSeed (seed: string){
        this.seed = seed;
    }

    public async setupMessanger() {
        this.Iota = new Iota(this.host + ':' + this.port, this.seed);
        messageStore.subscribeForMessages();
        contactStore.subscribeForContactRequests();
        contactStore.subscribeForeContactResponse();
        await this.Iota.bootstrapMessenger();
        this.myAddress = this.Iota.myAddress;
        // todo save myMessages with event subscriber on iota service
        console.log(this.myAddress)

    }
}

export const settingStore = new SettingStore();