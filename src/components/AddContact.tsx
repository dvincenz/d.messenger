import * as React from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { isValidChecksum } from '@iota/checksum';
import { contactStore } from 'src/stores/ContactStore';
import { ActiveDialog, settingStore } from "../stores/SettingStore";
import { observer } from "mobx-react";


interface IState {
    address: string,
    disableInput: boolean,
    error: string,
}

@observer
export class AddContact extends React.Component<{}, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            address: '',
            disableInput: false,
            error: ''
        }
    }

    public render() {
        return (
            <div>
                <Dialog
                    open={settingStore.activeDialog === ActiveDialog.AddContact}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Add Contact</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Please enter the Adress of you new contact.
                        </DialogContentText>
                        <TextField
                            onChange={this.handleInputChange}
                            autoFocus
                            margin="dense"
                            id="address"
                            label={this.state.error !== '' ? this.state.error : this.state.disableInput ? 'save...' : 'Address'}
                            type="text"
                            fullWidth
                            disabled={this.state.disableInput}
                            error={this.state.error !== ''}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} disabled={this.state.disableInput}  color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleSave} disabled={this.state.disableInput} color="primary">
                            Add Contact
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ 
            address: event.target.value,
            error: ''
         })
    }

    private handleClose = () => {
        settingStore.activeDialog = ActiveDialog.Default
    }

    private handleSave = () =>{
        try {
            isValidChecksum(this.state.address)
        } catch {
            this.setState({
                error: 'Invalid Address - try again'
            })
            return;
        }

        settingStore.activeDialog = ActiveDialog.Default
        contactStore.addContactRequest(this.state.address).then(
            () => this.setState({
                disableInput: false, 
            })
        );
    }
}