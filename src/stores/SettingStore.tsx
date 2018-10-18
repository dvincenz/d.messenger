
import { observable } from 'mobx'
export class SettingStore {
    // todo not fill with default values => store values in browser local storage
    @observable public seed: string = ''
    @observable public host: string = 'http://65.52.143.115'
    @observable public port: number = 14267

    public setSeed (seed: string){
        this.seed = seed;
    }

}

export const settingStore = new SettingStore();