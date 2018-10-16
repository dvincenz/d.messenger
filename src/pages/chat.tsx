import * as React from 'react';
import { Iota } from '../services/iotaService';
import { Sender } from '../components/Sender';
import { MessageDisplayer } from '../components/MessageDisplayer';
import { AddContact } from '../components/AddContact';
import { Button, AppBar, Toolbar, Typography, StyleRulesCallback, withStyles } from '@material-ui/core';
import { Contacts } from '../components/Contacts';

interface IState {
  addContactDialogOpen: boolean,
}

interface IProps {
  seed: string;
  classes: any;
}


const styles: StyleRulesCallback = theme => ({
  appBar: {
    position: 'relative',
  },
  main: {
    position: 'absolute',
    left: 300,
    top: 64,
    height: 'calc(100% - 132px)',
    width: 'calc(100% - 300px)'
  },
  contacts:{
    position: 'absolute',
    left: 0,
    top: 64,
    width: 300,
  }
})

class ChatComponent extends React.Component<IProps, IState> {
  private api: Iota;
  private tempAddress: string;
  constructor(porps: IProps){
    super(porps);
    this.api = new Iota('http://65.52.143.115:14267', porps.seed)
    // todo read all addresses from my seed an use it to construct chats
    this.tempAddress = 'LKVQLLCIWSFNRIY9YOHFNAMGHEZTPUEWDPWJWMCE9PRHMVWKIOPRCIMMTPCKEQH9GBQPKUNDBMODMMDMYNNISEAPYY'
    this.state = {
      addContactDialogOpen: false
    }
  }
  public render() {
    const { classes } = this.props
    return (
      <React.Fragment>
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <Typography component="h6" color="inherit" noWrap>
              d.messanger - logged in as Dumeni Vincenz
            </Typography>
          </Toolbar>
        </AppBar>
        <div id="contacts" className={classes.contacts}>
        <Button onClick={this.handleAddContactDialog}>Add Contact</Button>
          <AddContact iotaApi={this.api} open={this.state.addContactDialogOpen} />
          <Contacts iotaApi={this.api} />
        </div>
        <main id="main" className={classes.main}>
          <MessageDisplayer iotaApi={this.api}  activeAddress={this.tempAddress} />
          <Sender iotaApi={this.api} />
        </main>
      </React.Fragment>
    );
  }

  private handleAddContactDialog = () => {
    this.setState({
      addContactDialogOpen: true,
    })
  } 


}

export const Chat = withStyles(styles)(ChatComponent);
