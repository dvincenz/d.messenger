import * as React from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { Iota } from '../services/iotaService';



interface IPorps {
    iotaApi: Iota;
    open: boolean;
}
interface IState {
    open: boolean,
    address: string,
    disableInput: boolean
}

export class AddContact extends React.Component<IPorps, IState> {
    constructor(props: IPorps) {
        super(props);
        this.state = {
            open: props.open,
            address: '',
            disableInput: false,
        }
    }
    
    public render() {
        console.log('props: ' + this.props.open + 'state: ' + this.state.open)
        return (
            <div>
                <Dialog
                    open={this.state.open}
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
                            label={this.state.disableInput ? 'save...' : 'Address'}
                            type="text"
                            fullWidth
                            disabled={this.state.disableInput}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} disabled={this.state.disableInput}  color="primary">
                            Cancel
            </Button>
                        <Button onClick={this.handleSave} disabled={this.state.disableInput} color="primary">
                            Subscribe
            </Button>
                    </DialogActions>
                </Dialog>
            </div>

        );
    }

    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ address: event.target.value })
    }
    private handleClose(){
        this.setState({
            open: false
        })
    }
    private handleSave(){
        this.setState({
            disableInput: true,
        })
        // todo check if address is a valid address
        this.props.iotaApi.sendContactRequest(this.state.address).then(
            this.setState({
                open: false,
            })
        )
    }


}