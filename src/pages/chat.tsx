import * as React from 'react';
import { Sender} from '../components';
import { MessageDisplayer } from '../components/MessageDisplayer';
import { AddContact } from '../components/AddContact';
import { Button, StyleRulesCallback, withStyles, CircularProgress } from '@material-ui/core';
import { Contacts } from '../components/Contacts';
import { contactStore } from '../stores/ContactStore';
import {ActiveDialog, settingStore} from '../stores/SettingStore';
import { observer } from 'mobx-react';
import { Redirect } from 'react-router';
import { messageStore } from 'src/stores/MessageStore';
import { CreateGroup } from "../components/CreateGroup";
import { InviteContact } from "../components/InviteContact"
import { TitleBaar } from 'src/components/TitleBaar';

interface IState {
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
    height:'calc(100% - 64px)',
    overflow: 'auto',
    left: 0,
    top: 64,
    width: 300,
  },
  center:{
    position: 'absolute',
    margin: 'auto',
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    width: '100px',
    height: '100px'
  },
  progress:{
    margin: theme.spacing.unit * 2,
  }
})

@observer
class ChatComponent extends React.Component<IProps, IState> {
  constructor(props: IProps){
    super(props);
    this.state = {
      currentAddress: '',
      ice: ''
    }
  }
  public render() {
    const { classes } = this.props
    if (settingStore.seed === null) {
      return <Redirect to={{ pathname: '/login' }} />;
    }
    if (!settingStore.ready){
      return (
        <React.Fragment>
            <div className={classes.center}>
              <CircularProgress className={classes.progress} size={100} />
            </div>
        </React.Fragment>
      )
    }
    const isGroup = contactStore.currentContact && contactStore.currentContact.isGroup
    return (
      <React.Fragment>
        <TitleBaar />
        <div id="contacts" className={classes.contacts}>
          <Button onClick={this.handleAddContactDialog}>Add Contact</Button>
          <Button onClick={this.handleCreateGroupDialog}>Create Group</Button>
         
          <AddContact/>
          <CreateGroup/>
           {isGroup && <Button onClick={this.handleInviteContactDialog}>Invite Contact</Button>}
            {isGroup &&<InviteContact/>}
          <Contacts />
        </div>
        <main id="main" className={classes.main}>
          <MessageDisplayer />
          <Sender address={this.props.match.params.address} />
        </main>
      </React.Fragment>
    );
  }

  public componentDidMount () {
    if(settingStore.seed !== null){
      settingStore.setupMessanger().then( () =>{
        this.setAddress(this.props.match.params.address)
      })
    }
  }
  public componentDidUpdate () {
    this.setAddress(this.props.match.params.address);
  } 

  private setAddress = (addr: string) => {
    // todo routing by mobx 
    
      if(addr !== undefined  && (contactStore.currentContact === undefined || addr !== contactStore.currentContact.address)){
          messageStore.setFitlerMessages = addr;
          contactStore.setCurrentContact = addr;
      }
  } 

  private handleAddContactDialog = () => {
    settingStore.activeDialog = ActiveDialog.AddContact
  }

  private handleCreateGroupDialog = () => {
    settingStore.activeDialog = ActiveDialog.CreateGroup
  }

  private handleInviteContactDialog = () => {
    if(contactStore.currentContact !== undefined && contactStore.currentContact.isGroup) {
        settingStore.activeDialog = ActiveDialog.InviteContact
    }
  }
}

export const Chat = withStyles(styles)(ChatComponent);
