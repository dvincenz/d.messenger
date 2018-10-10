import * as React from 'react';
import { Button, TextField} from '@material-ui/core';
import { Iota } from '../services/iotaService';



interface IPorps {
    iotaApi: Iota;
}
interface IState {
    message: string
}

export class Sender extends React.Component<IPorps, IState> {
    constructor (props: IPorps){
        super(props);
        this.state = {
            message: ''
        }
    }
    public render() {
        return (
            <div>        
                <TextField value={this.state.message} onChange={this.handleInputChange}  label="Message"   />
                <Button 
                    variant="contained"
                    color="primary"  
                    id="send" 
                    onClick={this.handleSubmit}>Send Message</Button>
            </div>

        );
    }

    private handleSubmit = (): void => {
        const message = this.state.message;
        this.props.iotaApi.sendTextMessage('LKVQLLCIWSFNRIY9YOHFNAMGHEZTPUEWDPWJWMCE9PRHMVWKIOPRCIMMTPCKEQH9GBQPKUNDBMODMMDMYNNISEAPYY', message);
        
    }
    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({message: event.target.value})    
    }


}