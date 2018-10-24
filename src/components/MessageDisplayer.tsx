import * as React from 'react';
// import { Paper, TableHEad } from '@material-ui/core';
import { Iota, IMessageResponse} from '../services/iotaService';
import { StyleRulesCallback, withStyles } from '@material-ui/core';



interface IPorps {
    iotaApi: Iota;
    activeAddress: string;
    classes: any
}
interface IState {
    messages: IMessageResponse[]
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
       maxWidth: 250,
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
        paddingRight: theme.spacing.unit * 3,
        marginLeft: theme.spacing.unit * 2,
        height: '100%',
        overflowY: 'auto',
   }
})

export class MessageDisplayerComponent extends React.Component<IPorps, IState> {
    constructor(props: IPorps) {
        super(props);
        this.state = {
            messages: []
        }
        this.loadMessages([props.activeAddress]);
    }

    public render() {
        const messages = this.state.messages
        const { classes } = this.props
        return (
            <div className={classes.chatroom}>
                <ul className={classes.chats}>
                    {messages !== undefined && messages.length > 0 ? messages.map(
                        msg => {
                            return <MessageComponent key={msg.time} value={msg.message} classes={this.props.classes} />
                        }
                    ) : <p>ops no message found on tangle</p>}
                </ul>
            </div>

        );
    }
    
    private async loadMessages(addr: string[]){
        await this.props.iotaApi.loadData(addr, this.props.activeAddress)
        const msgs = this.props.iotaApi.getMessages()
        this.setState({messages: msgs})
    }
}

function MessageComponent(props: any){
    return <li className={props.classes.right} >{props.value}</li>
}


export const MessageDisplayer = withStyles(styles)(MessageDisplayerComponent) 