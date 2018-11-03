import * as React from 'react';
import { Sender } from '../components/Sender';
import { MessageDisplayer } from '../components/MessageDisplayer';
import { AddContact } from '../components/AddContact';
import { Button, AppBar, Toolbar, Typography, StyleRulesCallback, withStyles, TextField } from '@material-ui/core';
import { Contacts } from '../components/Contacts';
import { contactStore } from '../stores/ContactStore';
import { settingStore } from '../stores/SettingStore'
import { observer } from 'mobx-react';
import { Redirect } from 'react-router';
import { Contact } from '../entities';
import { WebRtcClient } from '../services/webRTCService'
import { messageStore } from 'src/stores/MessageStore';

interface IState {
  addContactDialogOpen: boolean;
  currentAddress: string;
  ice: string;

}

interface IProps {
  classes: any;
  match: any;
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

@observer
class ChatComponent extends React.Component<IProps, IState> {
  private webRtc: WebRtcClient
  constructor(props: IProps){
    super(props);
    this.state = {
      addContactDialogOpen: false,
      currentAddress: '',
      ice: ''
    }
    this.addDemoContact()
    this.webRtc = new WebRtcClient()
    // this.getMessages();
  }
  public render() {
    const { classes } = this.props
    if (settingStore.seed === '') {
      return <Redirect to={{ pathname: '/login' }} />;
    }

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
          <AddContact open={this.state.addContactDialogOpen} />
          <Contacts />
        </div>
        <main id="main" className={classes.main}>
          <MessageDisplayer address={this.props.match.params.address}/>
          <Sender address={this.props.match.params.address} />
          <TextField onChange={this.handleIceImput} className={classes.textbox} value={this.state.ice}/>
          <Button className={classes.button} variant="contained" color="primary" id="connect" onClick={this.handleConnect}>Connect</Button>
          <Button className={classes.button} variant="contained" color="primary" id="ice" onClick={this.getICE}>Get ICE</Button>

        </main>
      </React.Fragment>
    );
  }

  public componentDidMount () {
    if(settingStore.seed !== ''){
      settingStore.setupMessanger()
    }
  }

  private handleAddContactDialog = () => {
    this.setState({
      addContactDialogOpen: true,
    })
  } 

  private getICE = () => {
    this.setState({ice: JSON.stringify(this.webRtc.ice)})
  }

  private handleConnect = () => {
    this.webRtc.sendIce(this.state.ice);
  }

  private handleIceImput = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ice: event.target.value})
  }

  private  addDemoContact(): any {
    if(contactStore.contacts.length > 0){
      return;
    }
    const contact: Contact = {
      myName: 'dvi@1239876',
      name: "Dumeni",
      address: "LKVQLLCIWSFNRIY9YOHFNAMGHEZTPUEWDPWJWMCE9PRHMVWKIOPRCIMMTPCKEQH9GBQPKUNDBMODMMDMYNNISEAPYY",
      isActivated: true,
      secret: 'IABFKOELMGFJZVMGYBZF',
    }
    contactStore.addContactRequest(contact)
    const contact2: Contact = {
      myName: 'fancy@2345',
      name: "Fancy Address",
      address: "BVSVBGPVKRIDPANLUMTKJQEACJYEWQAIJKVEKDUYJEGMDDSPAIWLQRDLTQCFCVKZHUJ9PKTRJQHUCTCVYKSOTCV9T9",
      isActivated: true,
      secret: 'ZZIRGFYLQAPTSU9KRFKV',
    }
    contactStore.addContactRequest(contact2)
    const contact3: Contact = {
      myName: 'addr1@1234',
      name: "MyOwn Address",
      address: "IAXUZ9CFIZOIMMQGFUEMYEGPLFYDLBQWYKPMRAGZREMWSGSP9IJUSKBYOLK9DUCVXUDUCBNRPYDUQYLG9IZYKIX9Q9",
      isActivated: true,
      secret: 'IABFKOELMGFJZVMGYBZF'
    }
    contactStore.addContactRequest(contact3)

  }

}

export const Chat = withStyles(styles)(ChatComponent);
