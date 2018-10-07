import * as React from 'react';
// import { Paper, TableHEad } from '@material-ui/core';
import { Iota, Message} from '../services/IotaService';



interface IPorps {
    iotaApi: Iota;
    activeAddress: string;
}
interface IState {
    messages: Message[]
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
            <div>
                {messages.map(
                    msg => {
                        return <MessageComponent key={msg.time} value={msg.message} />
                    }
                )}
            </div>

        );
    }
    
    private loadMessages(){
        this.props.iotaApi.getMessages([this.props.activeAddress])
            .then( (msgs: Message[]) => {
                this.setState({messages: msgs})
            })
    }
}

function MessageComponent(props: any){
    return <li  >{props.value}</li>
}

