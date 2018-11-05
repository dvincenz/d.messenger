import * as React from 'react';
import { StyleRulesCallback, withStyles } from '@material-ui/core';
import { messageStore } from '../stores/MessageStore';
import { observer } from 'mobx-react';
import { contactStore } from '../stores/ContactStore';
import { settingStore } from 'src/stores/SettingStore';
import { getDateString } from 'src/utils';
import { ContactConfirmator } from './ContactConfirmator';

interface IPorps {
    classes: any;
}

const styles: StyleRulesCallback = theme => ({ // todo fix sizes with theme.spacing.unit
    right: {
        float: "right",
        clear: "both",
        backgroundColor: '#dcf8c6',
        position: 'relative',
        padding: '5px 10px',
        fontSize: 14,
        borderRadius: 10,
        listStyle: 'none',
        margin: '10px 0',
        maxWidth: 600,
    },
    left: {
        float: "left",
        clear: "both",
        backgroundColor: '#FFFFFF',
        position: 'relative',
        padding: '5px 10px',
        fontSize: 14,
        borderRadius: 10,
        listStyle: 'none',
        margin: '10px 0',
        maxWidth: 600,
    },
    chats: {
        boxSizing: 'border-box',
        paddingTop: 0,
        margin: '0 16px 0 16px',
        paddingRight: theme.spacing.unit * 3,
        height: '100%',
        overflowY: 'auto',
    },
    text: {
        paddingRight: 25,
    },
    time: {
        color: '#6d6d6d',
        fontSize: 8,
        textAlign: 'right',
        paddingTop: 5,

    },
    chatroom: {
        height: "100%",
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
        boxShadow: '0 0 8px 0 rgba(0,0,0, 0.3)'

    }

})
@observer
export class MessageDisplayerComponent extends React.Component<IPorps, {}> {
    constructor(props: IPorps) {
        super(props);
        this.state = {
            messages: []
        }
    }

    public render() {
        const { classes } = this.props
        if(contactStore.currentContact !== undefined && !contactStore.currentContact.isActivated){
            return (
                <ContactConfirmator />
            )
        }
        return (
            <div className={classes.chatroom}>
                <ul className={classes.chats}>
                    {messageStore !== undefined && messageStore.getMessagesFromAddress.length > 0 ? messageStore.getMessagesFromAddress.map(
                        msg => {
                            return <MessageComponent
                                key={msg.time}
                                value={msg.message}
                                time={msg.time}
                                classes={this.props.classes}
                                ownMessage={msg.reciverAddress.substring(0, 81) === settingStore.myAddress.substring(0, 81)}
                            />
                        }
                    ) : <p>{contactStore.currentContact === undefined ? "select a contact to display" : `loading messages for ${contactStore.currentContact.address}`}</p>}
                </ul>
            </div>

        );
    }
}


function MessageComponent(props: any) {
    return <li className={props.ownMessage ? props.classes.left : props.classes.right} >
        <div className={props.classes.text}>
            {props.value}
        </div>
        <div className={props.classes.time}>
            {getDateString(props.time)}
        </div>
    </li>
}


export const MessageDisplayer = withStyles(styles)(MessageDisplayerComponent) 