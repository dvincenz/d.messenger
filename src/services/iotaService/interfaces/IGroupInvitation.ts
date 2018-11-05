import {IBaseMessage} from "./IBaseMessage";

export interface IGroupInvitation extends IBaseMessage{
    groupName: string;
    groupAddress: string;
}