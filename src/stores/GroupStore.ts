import {flow, observable} from "mobx";
import {Group} from "../entities/Group";
import {settingStore} from "./SettingStore";
import {IGroupInvitation} from "../services/iotaService/interfaces/IGroupInvitation";
import {toContact, toGroup} from "../utils/Mapper";


export class GroupStore {
    @observable public groups: Group[] = [];
    @observable public state: GroupStoreState;

    public subscribeForGroupInvitations () {
        settingStore.Iota.subscribe("groupInvitation", (grps: IGroupInvitation[]) => {
            this.state = GroupStoreState.loading
            grps.forEach(g => {
                this.addGroup(g)
                settingStore.Iota.sendGroupInvitationResponse(g.address, settingStore.myName)
            })
            this.state = GroupStoreState.updated
        })
    }

    /* public fetchGroups = flow(function *(this: GroupStore) {
        this.state = GroupStoreState.loading
        try {
            const groups = yield settingStore.Iota.getGroups()
            groups.forEach((groupMessage: IBaseMessage) => {
                if(groupMessage.method === MessageMethod.GroupInvitation) {
                    const invitation = (groupMessage as IGroupInvitation)
                    this.addGroup(invitation)
                    settingStore.Iota.sendGroupInvitationResponse(groupMessage.address, "NAME") // TODO ownName generieren
                }
            })
            this.state = GroupStoreState.updated
        } catch (error) {
            this.state = GroupStoreState.error
            console.log(error)
        }
    }) */

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