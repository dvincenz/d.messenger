import * as React from 'react';
import './App.css';
import logo from './logo.svg';
import { Iota } from './services/iotaService';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Login } from './pages';

interface IState {
  addContactDialogOpen: boolean,
}

class App extends React.Component<{}, IState> {
  private api: Iota;
  private tempAddress: string;
  constructor(porps: {}) {
    super(porps);
  }
  public render() {
    return (
      <div>
        <BrowserRouter>
            <Switch>
              <Route path="/login" component={Login} />
              <Route exact path="/" component={Login} />
            </Switch>
          </BrowserRouter>
        
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
