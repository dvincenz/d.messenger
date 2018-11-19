import * as React from 'react';
import { Button, TextField, withStyles, StyleRulesCallback} from '@material-ui/core';
import { messageStore } from '../stores/MessageStore';
import { contactStore } from '../stores/ContactStore';
import { Contact } from '../entities';


interface IPorps {
    classes: any;
    address: string;
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
                <TextField
                  className={classes.textbox}
                  disabled={contactStore.currentContact === undefined}
                  value={this.state.message}
                  onChange={this.handleInputChange}
                  onKeyPress={this.handleReturn}
                  label="Message"
                />
                <Button 
                    disabled={contactStore.currentContact === undefined}
                    className={classes.button}
                    variant="contained"
                    color="primary"  
                    id="send" 
                    onClick={this.handleSubmit}>Send Message</Button>
            </div>
        );
    }

    private handleSubmit = (): void => {
        const msg = this.state.message;
        if(msg.trim().length > 0) {
          this.setState({message: ''})
          if (contactStore === undefined) {
            console.error('error, no address aviable')
            return
          }
          messageStore.sendMessage(contactStore.currentContact as Contact, msg)
        }
    }
    
    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({message: event.target.value})
    }

    private handleReturn = (event: React.KeyboardEvent): void => {
        if(event.key === 'Enter') {
            this.handleSubmit();
        }
    }
}

export const Sender = withStyles(styles)(SenderComponent);