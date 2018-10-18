import * as React from 'react';
import { Iota } from '../services/iotaService';
import { Sender } from '../components/Sender';
import { MessageDisplayer } from '../components/MessageDisplayer';
import { AddContact } from '../components/AddContact';
import { Button, AppBar, Toolbar, Typography, StyleRulesCallback, withStyles } from '@material-ui/core';
import { Contacts } from '../components/Contacts';
import { messageStore } from '../stores/MessageStore';
import { settingStore } from '../stores/SettingStore'
import { observer } from 'mobx-react';
import { Redirect } from 'react-router';

interface IState {
  addContactDialogOpen: boolean;
  currentAddress: string;
}

interface IProps {
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

@observer
class ChatComponent extends React.Component<IProps, IState> {
  private api: Iota;
  constructor(props: IProps){
    super(props);
    this.api = new Iota(settingStore.host + ':' + settingStore.port , settingStore.seed)
    this.state = {
      addContactDialogOpen: false,
      currentAddress: '',
    }
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
          <AddContact iotaApi={this.api} open={this.state.addContactDialogOpen} />
          <Contacts iotaApi={this.api} selectContact={this.selectContact} />
        </div>
        <main id="main" className={classes.main}>
          <MessageDisplayer />
          <Sender messageStore={messageStore} />
        </main>
      </React.Fragment>
    );
  }

  private handleAddContactDialog = () => {
    this.setState({
      addContactDialogOpen: true,
    })
  } 

  // private getMessages = async () => {
  //    const mesgs = await this.api.getMessages(this.state.currentAddress);
  //     this.setState({messages: mesgs})
  // }

  private selectContact = (addr: string) => {
    if(addr !== ''){
      this.setState({
        currentAddress: addr
      })
    }
  }
}

export const Chat = withStyles(styles)(ChatComponent);
