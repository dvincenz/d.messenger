import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Login, Chat } from './pages';

interface IState {
  seed: string,
  isLoggedIn: boolean,
}

class App extends React.Component<{}, IState> {
  constructor(porps: {}) {
    super(porps);
    this.state = {
      seed: '',
      isLoggedIn: false
    }
  }
  public render() {
    return (

      <div>
        <BrowserRouter>
            <Switch>
              <Route path="/login" component={Login}  />
              <Route exact path="/chat/:address" component={Chat} />
              <Route exact path="/chat" component={Chat} />
              <Route exact path="/" component={Login} />
            </Switch>
          </BrowserRouter>
        
      </div>
    );
  }

}





export default App;
