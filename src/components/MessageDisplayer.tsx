import * as React from 'react';
// import { Paper, TableHEad } from '@material-ui/core';
import { Iota, IMessageResponse} from '../services/iotaService';



interface IPorps {
    iotaApi: Iota;
    activeAddress: string;
}
interface IState {
    messages: IMessageResponse[]
}


export class MessageDisplayer extends React.Component<IPorps, IState> {
    constructor(props: IPorps) {
        super(props);
        this.state = {
            messages: []
        }
        this.loadMessages();
    }

    public render() {
        const messages = this.state.messages
        console.log(messages);
        return (
            <ul className="chats">
                {messages !== undefined && messages.length > 0 ? messages.map(
                    msg => {
                        return <MessageComponent key={msg.time} value={msg.message} />
                    }
                ) : <p>ops no message found on tangle</p>}
            </ul>

        );
    }
    
    private loadMessages(){
        this.props.iotaApi.getMessages([this.props.activeAddress])
            .then( (msgs: IMessageResponse[]) => {
                this.setState({messages: msgs})
            })
    }
}

function MessageComponent(props: any){
    return <li className="chat right" >{props.value}</li>
}

