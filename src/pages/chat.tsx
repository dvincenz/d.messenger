import * as React from 'react';
import { Sender} from '../components';
import { MessageDisplayer } from '../components/MessageDisplayer';
import { AddContact } from '../components/AddContact';
import { Button, AppBar, Toolbar, Typography, StyleRulesCallback, withStyles, TextField } from '@material-ui/core';
import { Contacts } from '../components/Contacts';
import { contactStore } from '../stores/ContactStore';
import { settingStore } from '../stores/SettingStore'
import { observer } from 'mobx-react';
import { Redirect } from 'react-router';
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
  constructor(props: IProps){
    super(props);
    this.state = {
      addContactDialogOpen: false,
      currentAddress: '',
      ice: ''
    }
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
           <MessageDisplayer />
          <Sender address={this.props.match.params.address} />
          <TextField onChange={this.handleIceImput} className={classes.textbox} value={this.state.ice}/>
          <Button className={classes.button} variant="contained" color="primary" id="connect" >Connect</Button>
          <Button className={classes.button} variant="contained" color="primary" id="ice" onClick={this.getICE}>Get ICE</Button>

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
    
      if(addr !== undefined && (contactStore.currentContact === undefined || addr !== contactStore.currentContact.address)){
          messageStore.setFitlerMessages = addr;
          contactStore.setCurrentContact = addr;
      }
  } 

  private handleAddContactDialog = () => {
    this.setState({
      addContactDialogOpen: true,
    })
  } 

  private getICE = () => {
    contactStore.sendIce(contactStore.currentContact);
  }


  private handleIceImput = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ice: event.target.value})
  }


}

export const Chat = withStyles(styles)(ChatComponent);
