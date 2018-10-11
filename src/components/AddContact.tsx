import * as React from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { Iota } from '../services/iotaService';
import { isValidChecksum } from '@iota/checksum';



interface IPorps {
    iotaApi: Iota;
    open: boolean;
}
interface IState {
    open: boolean,
    address: string,
    disableInput: boolean,
    error: string,
    bevoreOpen:boolean,
    

}

export class AddContact extends React.Component<IPorps, IState> {
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
            address: '',
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
        console.log('should close')
        this.setState({
            open: false
        })
    }
    private handleSave = () =>{
        try{
            isValidChecksum(this.state.address)
        } catch {
            this.setState({
                error: 'Invalid Address - try again'
            })
            return;
        }
        this.setState({
            disableInput: true,
        })
        this.props.iotaApi.sendContactRequest(this.state.address).then(
            () => this.setState({ 
                open: false,
                disableInput: false, 
            })
        );
        
    }


}