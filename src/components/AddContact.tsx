import * as React from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Select, MenuItem, StyleRulesCallback, withStyles, InputLabel, CircularProgress, Input } from '@material-ui/core';
import { isValidChecksum } from '@iota/checksum';
import { contactStore } from 'src/stores/ContactStore';
import { ActiveDialog, settingStore } from "../stores/SettingStore";
import { observer } from "mobx-react";
import { IPublicContact } from 'src/services/iotaService/interfaces/IPublicContact';


interface IState {
    name: string,
    disableInput: boolean,
    error: string,
    contacts: IPublicContact[],
    searchingContact: boolean,
    selectedAddress: string
}

interface IPorps {
    classes: any
}

const styles: StyleRulesCallback = theme => ({
    dialog: {
        width: '500px',
      },
      selectMenu: {
        overflow: "hidden",
        minHeight: "1.1875em",
        textOverflow: "ellipsis",        
        wordBreak: "break-all",
        whiteSpace: "pre-wrap",
        width: "470px"
    },

})

@observer
class AddContactComponent extends React.Component<IPorps, IState> {
    private searchTimeout: any = 0;
    constructor(props: any) {
        super(props);
        this.state = {
            name: '',
            disableInput: false,
            error: '',
            contacts: [],
            searchingContact: false,
            selectedAddress: '',
            
        }
    }

    public render() {
        const { classes } = this.props;
        return (
            <div>
                <Dialog
                    open={settingStore.activeDialog === ActiveDialog.AddContact}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                    
                >
                    <DialogTitle id="form-dialog-title">Add Contact</DialogTitle>
                    <DialogContent className={classes.dialog}>
                        <DialogContentText>
                            Search contact by name
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
                        <InputLabel shrink htmlFor="address">{this.state.searchingContact && <CircularProgress size={12} className={classes.progress} />} Address</InputLabel>
                        <Select
                            classes={{ selectMenu: classes.selectMenu }}
                            disabled={this.state.contacts.length <= 1 || this.state.searchingContact || this.state.disableInput}
                            value={this.state.selectedAddress}
                            onChange={this.handleComboChange}
                            input={<Input name="Address" id="address" />}
                        >
                            <MenuItem value="noValue">
                                {this.state.contacts && this.state.contacts.length === 0 ? <em>Address not found</em> : <em>Multiple addresses select one</em>}
                            </MenuItem>
                            {this.state.contacts.length !== 0 && this.state.contacts.map(f => {
                                return (
                                    <MenuItem key={f.myAddress} value={f.myAddress}>{f.myAddress}</MenuItem>
                                )

                            })}

                        </Select>
                    </DialogContent>
                   
                    <DialogActions>
                        <Button onClick={this.handleClose} disabled={this.state.disableInput}  color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleSave} disabled={this.state.disableInput || this.state.selectedAddress === '' || this.state.selectedAddress === 'noValue'} color="primary">
                            Add Contact
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
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        if (this.state.name === '') {
            return
        }
        this.searchTimeout = setTimeout(() => {
            this.setState({
                searchingContact: true,
                selectedAddress: '',
            })
            settingStore.Iota.searchContactByName(this.state.name).then(c =>{
                this.setState({
                    contacts: c.map(i => i as IPublicContact),
                    searchingContact: false,
                    selectedAddress: c.length === 1 ?  (c[0] as IPublicContact).myAddress : "noValue"
                
                })
            })
        }, 300)
    }

    private handleClose = () => {
        settingStore.activeDialog = ActiveDialog.Default
    }

    private handleComboChange = (event: React.ChangeEvent<HTMLSelectElement>) =>{
        this.setState({
            selectedAddress: event.target.value
        })
    }

    private handleSave = () =>{
        try {
            isValidChecksum(this.state.selectedAddress)
        } catch {
            this.setState({
                error: 'Invalid Address - try again'
            })
            return;
        }

        settingStore.activeDialog = ActiveDialog.Default
        contactStore.addContactRequest(this.state.contacts.filter(c => c.myAddress === this.state.selectedAddress)[0]).then(
            () => this.setState({
                disableInput: false, 
            })
        );
    }
}

export const AddContact = withStyles(styles)(AddContactComponent)