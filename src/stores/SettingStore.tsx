
import { observable } from 'mobx'
export class SettingStore {
    // todo not fill with default values => store values in browser local storage
    @observable public seed: string = 'AUZHTFWRCCJY9INBKOECSIVCUORQIJWXPJHIRQZBRNHTEVXPGLFNOXLVEMEBWAXAOKUFNOCYNKTRGFSUA'
    @observable public host: string = 'http://13.93.79.127'
    @observable public port: number = 14267

    public setSeed (seed: string){
        this.seed = seed;
    }

}

export const settingStore = new SettingStore();