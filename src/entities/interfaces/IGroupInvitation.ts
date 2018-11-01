import {IBaseMessage, MessageMethod} from "./IBaseMessage";

export interface IGroupInvitation extends IBaseMessage{
    groupName: string;
    groupAddress: string;
}