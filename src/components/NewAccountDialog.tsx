import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from "@material-ui/core";
import * as React from "react";

export function NewAccountDialog(props: any) {

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Your local automated created private key</DialogTitle>
      <DialogContent>
        <DialogContentText  id="alert-dialog-description">
          Keep your privateKey save. It's your access token to your messages on d.messenger
        </DialogContentText>
        <TextField
          multiline
          className={props.classes.privatKeyTextbox}
          value={props.privateKey}
          inputProps={{size: 81}}
          onChange={props.handleSeedChange}
          autoFocus
          onFocus={props.handleSeedChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} disabled={props.isLoading} color="primary">
          Copy PrivateKey & Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}