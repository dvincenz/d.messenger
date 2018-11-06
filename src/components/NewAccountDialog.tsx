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
      <DialogTitle id="alert-dialog-title">Your new fresh seed</DialogTitle>
      <DialogContent>
        <DialogContentText  id="alert-dialog-description">
          Keep your seed save. It's your access token to your messages on d.messenger
        </DialogContentText>
        <TextField
          multiline
          className={props.classes.seedTextbox}
          value={props.seed}
          inputProps={{size: 81}}
          onChange={props.handleSeedChange}
          autoFocus
          onFocus={props.handleSeedChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} color="primary">
          Copy seed & Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}