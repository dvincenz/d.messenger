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
        const currentContact = contactStore.currentContact
        return (
            <div>        
                <TextField
                  className={classes.textbox}
                  disabled={currentContact === undefined}
                  value={this.state.message}
                  onChange={this.handleInputChange}
                  onKeyPress={this.handleReturn}
                  label="Message"
                />
                <Button 
                    disabled={currentContact === undefined || (currentContact.publicKey === undefined && !currentContact.isGroup) || !currentContact.isActivated}
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
        this.setState({message: ''})
        if (contactStore === undefined) {
          console.error('error, no address available')
          return
        }
        messageStore.sendMessage(contactStore.currentContact as Contact, msg)
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