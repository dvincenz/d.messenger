import * as React from 'react';
import { Sender} from '../components';
import { MessageDisplayer } from '../components/MessageDisplayer';
import { AddContact } from '../components/AddContact';
import { Button, AppBar, Toolbar, Typography, StyleRulesCallback, withStyles } from '@material-ui/core';
import { Contacts } from '../components/Contacts';
import { contactStore } from '../stores/ContactStore';
import { settingStore } from '../stores/SettingStore';
import { observer } from 'mobx-react';
import { Redirect } from 'react-router';
import { messageStore } from 'src/stores/MessageStore';
import { CreateGroup } from "../components/CreateGroup";
import { InviteContact } from "../components/InviteContact"

interface IState {
  addContactDialogOpen: boolean;
  createGroupDialogOpen: boolean;
  inviteContactDialogOpen: boolean;
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
  constructor(props: IProps){
    super(props);
    this.state = {
      addContactDialogOpen: false,
      createGroupDialogOpen: false,
      inviteContactDialogOpen: false,
      currentAddress: '',
      ice: ''
    }
  }
  public render() {
    const { classes } = this.props
    if (settingStore.seed === '') {
      return <Redirect to={{ pathname: '/login' }} />;
    }
    const isGroup = contactStore.currentContact && contactStore.currentContact.isGroup
    return (
      <React.Fragment>
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <Typography component="h6" color="inherit" noWrap>
              d.messanger - your public address: {settingStore.myAddress}
            </Typography>
          </Toolbar>
        </AppBar>
        <div id="contacts" className={classes.contacts}>
          <Button onClick={this.handleAddContactDialog}>Add Contact</Button>
          <Button onClick={this.handleCreateGroupDialog}>Create Group</Button>
         
          <AddContact open={this.state.addContactDialogOpen} />
          <CreateGroup open={this.state.createGroupDialogOpen} />
           {isGroup && <Button onClick={this.handleInviteContactDialog}>Invite Contact</Button>}
            {isGroup &&<InviteContact open={this.state.inviteContactDialogOpen} />}
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
    if(settingStore.seed !== ''){
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
    this.setState({
      addContactDialogOpen: true,
    })
  }

  private handleCreateGroupDialog = () => {
    this.setState({
      createGroupDialogOpen: true,
    })
  }

  private handleInviteContactDialog = () => {
    if(contactStore.currentContact !== undefined && contactStore.currentContact.isGroup) {
        this.setState({
            inviteContactDialogOpen: true,
        })
    }
  }


}

export const Chat = withStyles(styles)(ChatComponent);
