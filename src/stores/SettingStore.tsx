
import { observable } from 'mobx'
import { Iota } from '../services/iotaService';
export class SettingStore {
    // todo not fill with default values => store values in browser local storage
    @observable public seed: string = 'AUZHTFWRCCJY9INBKOECSIVCUORQIJWXPJHIRQZBRNHTEVXPGLFNOXLVEMEBWAXAOKUFNOCYNKTRGFSUA'
    @observable public host: string = 'http://13.93.79.127'
    @observable public port: number = 14267
    public Iota: Iota;
    constructor () {
        this.Iota = new Iota(this.host + ':' + this.port, this.seed, 'IAXUZ9CFIZOIMMQGFUEMYEGPLFYDLBQWYKPMRAGZREMWSGSP9IJUSKBYOLK9DUCVXUDUCBNRPYDUQYLG9IZYKIX9Q9');
    }
    public setSeed (seed: string){
        this.seed = seed;
    }
}

export const settingStore = new SettingStore();