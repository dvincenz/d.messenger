import {IBaseMessage, MessageMethod} from "./IBaseMessage";

export interface IGroupInvitation extends IBaseMessage{
    groupAddress: string;
}