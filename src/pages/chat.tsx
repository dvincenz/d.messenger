import * as React from 'react';
import { Iota } from '../services/iotaService';
import { Sender } from '../components/Sender';
import { MessageDisplayer } from '../components/MessageDisplayer';
import { AddContact } from '../components/AddContact';
import { Button } from '@material-ui/core';

interface IState {
  addContactDialogOpen: boolean,
}

class ChatCOmponent extends React.Component<{}, IState> {
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
    return (
        <div className="chatroom">
          <MessageDisplayer iotaApi={this.api} activeAddress={this.tempAddress} />
          <Sender iotaApi={this.api} />
          <Button onClick={this.handleAddContactDialog}>Add Contact</Button>
          <AddContact iotaApi={this.api} open={this.state.addContactDialogOpen}  />
          
        </div>
    );
  }

  private handleAddContactDialog = () => {
    this.setState({
      addContactDialogOpen: true,
    })
  } 
}

export const Chat = ChatCOmponent;
