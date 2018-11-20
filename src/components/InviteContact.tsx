import * as React from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import {contactStore} from "../stores/ContactStore";
import {ActiveDialog, settingStore} from "../stores/SettingStore";
import {observer} from "mobx-react";


interface IPorps {
    open: boolean,
}

interface IState {
    address: string,
    disableInput: boolean,
    error: string,
}

@observer
export class InviteContact extends React.Component<IPorps, IState> {
    constructor(props: IPorps) {
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
                    open={settingStore.activeDialog === ActiveDialog.InviteContact}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Invite Contact</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Please enter the address of the account.
                        </DialogContentText>
                        <TextField
                            onChange={this.handleInputChange}
                            autoFocus
                            margin="dense"
                            id="name"
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
                            Invite Contact
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

    private handleSave = () => {
        const groupAddr: string = contactStore.currentContact.address
        const groupName: string = contactStore.currentContact.name

        settingStore.activeDialog = ActiveDialog.Default
        contactStore.inviteContact(this.state.address, groupAddr, groupName).then(
            () => this.setState({
                disableInput: false,
            })
        )
    }
}