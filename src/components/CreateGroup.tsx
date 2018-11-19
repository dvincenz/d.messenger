import * as React from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import {contactStore} from "../stores/ContactStore";
import {ActiveDialog, settingStore} from "../stores/SettingStore";


interface IPorps {
    open: boolean;
}

interface IState {
    open: boolean,
    name: string,
    disableInput: boolean,
    error: string,
    bevoreOpen:boolean,
}

export class CreateGroup extends React.Component<IPorps, IState> {
    public static getDerivedStateFromProps(props: IPorps, state: IState) {
        if (state.open !== state.bevoreOpen){
            return {
                bevoreOpen: state.open,
            }
        }
        if (props.open !== state.open) {
            return {
                open: props.open,
                bevoreOpen: props.open
            };
        }
        return null;
    }
    constructor(props: IPorps) {
        super(props);
        this.state = {
            open: props.open,
            bevoreOpen: props.open,
            name: '',
            disableInput: false,
            error: ''
        }
    }

    public render() {
        return (
            <div>
                <Dialog
                    open={this.state.open}
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
        this.setState({
            open: false
        })
    }

    private handleSave = () => {
        settingStore.activeDialog = ActiveDialog.Default
        contactStore.createGroup(this.state.name).then(
            () => this.setState({
                open: false,
                disableInput: false,
            })
        );
    }
}