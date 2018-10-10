import * as React from 'react';
import './App.css';
import logo from './logo.svg';
import { Iota } from './services/iotaService';
import { Sender } from './components/Sender';
import { MessageDisplayer } from './components/MessageDisplayer';
import { AddContact } from './components/AddContact';
import { Button } from '@material-ui/core';

interface IState {
  addContactDialogOpen: boolean,
}

class App extends React.Component<{}, IState> {
  private api: Iota;
  private tempAddress: string;
  constructor(porps: {}){
    super(porps);
    this.api = new Iota('http://65.52.143.115:14267', 'AUZHTFWRCCJY9INBKOECSIVCUORQIJWXPJHIRQZBRNHTEVXPGLFNOXLVEMEBWAXAOKUFNOCYNKTRGFSUA')
    this.tempAddress = 'LKVQLLCIWSFNRIY9YOHFNAMGHEZTPUEWDPWJWMCE9PRHMVWKIOPRCIMMTPCKEQH9GBQPKUNDBMODMMDMYNNISEAPYY'
    this.state = {
      addContactDialogOpen: false
    }
  }
  public render() {  
    console.log(this.state.addContactDialogOpen);
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to d.messanger</h1>
        </header>
        <div className="chatroom">
          <MessageDisplayer iotaApi={this.api} activeAddress={this.tempAddress} />
          <Sender iotaApi={this.api} />
          <Button onClick={this.handleAddContactDialog}>Add Contact</Button> <AddContact iotaApi={this.api} open={this.state.addContactDialogOpen}  />
          
        </div>
      </div>
    );
  }

  private handleAddContactDialog = () => {
    this.setState({
      addContactDialogOpen: true,
    })
  } 
}





export default App;
