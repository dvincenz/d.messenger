import {flow, observable} from "mobx";
import {Group} from "../entities/Group";
import {settingStore} from "./SettingStore";
import {IBaseMessage} from "../entities/interfaces";
import {IGroupInvitation} from "../entities/interfaces/IGroupInvitation";
import {toGroup} from "../utils/Mapper";


export class GroupStore {
    @observable public groups: Group[] = [];
    @observable public state: GroupStoreState;

    public fetchGroups = flow(function *(this: GroupStore) {
        this.state = GroupStoreState.loading
        try {
            const groups = yield settingStore.Iota.getGroups()
            groups.forEach((group: IBaseMessage) => {
                this.addGroup(group)
            })
            this.state = GroupStoreState.updated
        } catch (error) {
            this.state = GroupStoreState.error
            console.log(error)
        }
    })

    private addGroup(inv: IBaseMessage) {
        this.groups.push(toGroup((inv as IGroupInvitation)))
    }
}

export const groupStore = new GroupStore();

export enum GroupStoreState{
    loading,
    doPoW,
    updated,
    error,
}