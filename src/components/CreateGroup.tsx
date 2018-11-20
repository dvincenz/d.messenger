import * as React from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import {contactStore} from "../stores/ContactStore";
import {ActiveDialog, settingStore} from "../stores/SettingStore";
import {observer} from "mobx-react";


interface IPorps {
    open: boolean,
}

interface IState {
    name: string,
    disableInput: boolean,
    error: string,
}

@observer
export class CreateGroup extends React.Component<IPorps, IState> {
    constructor(props: IPorps) {
        super(props);
        this.state = {
            name: '',
            disableInput: false,
            error: ''
        }
    }

    public render() {
        return (
            <div>
                <Dialog
                    open={settingStore.activeDialog === ActiveDialog.CreateGroup}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Create Group</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Please enter the Group name.
                        </DialogContentText>
                        <TextField
                            onChange={this.handleInputChange}
                            autoFocus
                            margin="dense"
                            id="name"
                            label={this.state.error !== '' ? this.state.error : this.state.disableInput ? 'save...' : 'Name'}
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
                            Create Group
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({
            name: event.target.value,
            error: ''
        })
    }

    private handleClose = () => {
        settingStore.activeDialog = ActiveDialog.Default
    }

    private handleSave = () => {
        settingStore.activeDialog = ActiveDialog.Default
        contactStore.createGroup(this.state.name).then(
            () => this.setState({
                disableInput: false,
            })
        );
    }
}