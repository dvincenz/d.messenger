import * as React from 'react';
import { StyleRulesCallback, withStyles } from '@material-ui/core';
import { messageStore } from '../stores/MessageStore';
import { observer } from 'mobx-react';

interface IPorps {
    classes: any;
    address: string;
}

const styles: StyleRulesCallback = theme => ({ // todo fix sizes with theme.spacing.unit
   right: {
       float: "right",
       clear: "both",
       backgroundColor: '#FFFFFF',
       position: 'relative',
       padding:  '5px 10px', 
       fontSize: 14,
       borderRadius:10,
       listStyle: 'none',
       margin: '10px 0',
       maxWidth: 600,
   },
   chatroom: {
       height: "100%",
       backgroundColor: '#e0e0e0',
       overflow: 'hidden',
       boxShadow: '0 0 8px 0 rgba(0,0,0, 0.3)'

   },
   chats:{
        boxSizing: 'border-box',
        paddingTop: 0,
        margin: '0 16px 0 16px',
        paddingRight: theme.spacing.unit * 3,
        height: '100%',
        overflowY: 'auto',
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
        return (
            <div className={classes.chatroom}>
                <ul className={classes.chats}>
                    {messageStore !== undefined && messageStore.getMessagesFromAddress.length > 0 ? messageStore.getMessagesFromAddress.map(
                        msg => {
                            return <MessageComponent key={msg.time} value={msg.message + ' ' + msg.contact.name} classes={this.props.classes} />
                        }
                    ) : <p>loading messages for {this.props.address}...</p>}
                </ul>
            </div>

        );
    }
    
    public componentDidMount(){
        this.setAddress(this.props.address);
    }
    public componentDidUpdate () {
        this.setAddress(this.props.address);
    }

    private setAddress (addr: string){
        if(addr !== undefined && addr !== messageStore.address){
            messageStore.setFitlerMessages = addr;
        }
    } 
}


function MessageComponent(props: any){
    return <li className={props.classes.right} >{props.value}</li>
}


export const MessageDisplayer = withStyles(styles)(MessageDisplayerComponent) 