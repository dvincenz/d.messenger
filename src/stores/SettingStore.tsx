
import { observable } from 'mobx'
import { Iota } from '../services/iotaService';
export class SettingStore {
    // todo not fill with default values => store values in browser local storage
    @observable public seed: string = '' // 'AUZHTFWRCCJY9INBKOECSIVCUORQIJWXPJHIRQZBRNHTEVXPGLFNOXLVEMEBWAXAOKUFNOCYNKTRGFSUA'
    @observable public host: string = 'http://13.93.79.127'
    @observable public port: number = 14267
    public myAddress: string;
    public Iota: Iota;
    constructor () {
        this.Iota = new Iota(this.host + ':' + this.port, this.seed);
    }
    public setSeed (seed: string){
        this.seed = seed;
    }

    public async setupMessanger() {
        console.log(this.seed)
        this.Iota = new Iota(this.host + ':' + this.port, this.seed);
        const myMessages = await this.Iota.bootstrapMessenger();
        this.myAddress = this.Iota.myAddress;
        // todo save myMessages with event subscriber on iota service
        console.log(this.myAddress)
    }
}

export const settingStore = new SettingStore();