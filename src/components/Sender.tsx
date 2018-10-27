import * as React from 'react';
import { Button, TextField, withStyles, StyleRulesCallback} from '@material-ui/core';
import { messageStore } from '../stores/MessageStore';
import { Message } from '../models';



interface IPorps {
    classes: any;
}
interface IState {
    message: string
}

const styles: StyleRulesCallback = theme => ({
    button: {
        margin: '22px 20px 0'
    },
    textbox: {
        margin: '10px 0',
        width: 'calc(100% - 210px)' // todo fix ugly hotfix
    }

})

export class SenderComponent extends React.Component<IPorps, IState> {
    constructor (props: IPorps){
        super(props);
        this.state = {
            message: ''
        }
    }
    public render() {
        const { classes } = this.props
        return (
            <div>        
                <TextField className={classes.textbox} value={this.state.message} onChange={this.handleInputChange}  label="Message"   />
                <Button 
                    className={classes.button}
                    variant="contained"
                    color="primary"  
                    id="send" 
                    onClick={this.handleSubmit}>Send Message</Button>
            </div>

        );
    }

    private handleSubmit = (): void => {
        // get Conntact address form contact store
        const addr = 'IAXUZ9CFIZOIMMQGFUEMYEGPLFYDLBQWYKPMRAGZREMWSGSP9IJUSKBYOLK9DUCVXUDUCBNRPYDUQYLG9IZYKIX9Q9'
        const msg = this.state.message;
        this.setState({message: ''})
        messageStore.sendMessage(addr, msg)
        
    }
    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({message: event.target.value})    
    }
}

export const Sender = withStyles(styles)(SenderComponent);