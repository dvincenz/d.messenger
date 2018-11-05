import {computed, flow, observable} from "mobx";
import {Group} from "../entities/Group";
import {settingStore} from "./SettingStore";
import {IGroupInvitation} from "../services/iotaService/interfaces/IGroupInvitation";
import {toGroup} from "../utils/Mapper";
import {getRandomSeed} from "../utils";


export class GroupStore {
    @observable public groups: Group[] = [];
    @observable public state: GroupStoreState;


    public createGroup = flow(function *(this: GroupStore, name: string) {
        this.state = GroupStoreState.loading
        try {
            const groupAddr = getRandomSeed(81)
            yield settingStore.Iota.sendGroupInvitation(settingStore.myAddress, groupAddr, name)
            console.log(name)
            console.log(groupAddr)
            console.log(settingStore.myAddress)
            this.state = GroupStoreState.updated
        } catch (error) {
            this.state = GroupStoreState.error
            console.log(error)
        }
    })

    // tslint:disable-next-line:variable-name
    @observable private _currentGroup?: string;


    @computed get currentGroup(): Group {
        return this.groups[this._currentGroup]
    }

    set setCurrentGroup(address: string) {
        this._currentGroup = address
    }

    @computed get getGroups () {
        const groupsArray = []
        // tslint:disable-next-line:forin
        for(const key in this.groups) {
            groupsArray.push(this.groups[key])
        }
        console.log(this.groups.length)
        return groupsArray
    }

    public subscribeForGroupInvitations () {
        settingStore.Iota.subscribe("groupInvitation", (grps: IGroupInvitation[]) => {
            this.state = GroupStoreState.loading
            grps.forEach(g => {
                this.addGroup(g)
            })
            this.state = GroupStoreState.updated
        })
    }

    private addGroup(invitation: IGroupInvitation) {
        this.groups.push(toGroup(invitation))
    }
}

export const groupStore = new GroupStore();

export enum GroupStoreState{
    loading,
    doPoW,
    updated,
    error,
}