import * as React from 'react';
import './App.css';
import logo from './logo.svg';
import { Iota } from './services/IotaService';
import { Sender } from './components/Sender';
import { MessageDisplayer } from './components/MessageDisplayer';


class App extends React.Component<{}> {
  private api: Iota;
  private tempAddress: string;
  constructor(porps: {}){
    super(porps);
    this.api = new Iota('http://65.52.143.115:14267', 'AUZHTFWRCCJY9INBKOECSIVCUORQIJWXPJHIRQZBRNHTEVXPGLFNOXLVEMEBWAXAOKUFNOCYNKTRGFSUA')
    this.tempAddress = 'LKVQLLCIWSFNRIY9YOHFNAMGHEZTPUEWDPWJWMCE9PRHMVWKIOPRCIMMTPCKEQH9GBQPKUNDBMODMMDMYNNISEAPYY'
  }
  public render() {  
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to d.messanger</h1>
        </header>
        <div className="chatroom">
          <MessageDisplayer iotaApi={this.api} activeAddress={this.tempAddress} />
          <Sender iotaApi={this.api} />
        </div>
      </div>
    );
  }
}





export default App;
