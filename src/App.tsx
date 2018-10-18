import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Login, Chat } from './pages';
import { settingStore } from './stores/SettingStore'

interface IState {
  seed: string,
  isLoggedIn: boolean,
}

class App extends React.Component<{}, IState> {
  constructor(porps: {}) {
    super(porps);
    this.state = {
      seed: '',
      isLoggedIn: false,
    }
  }
  public render() {
    return (

      <div>
        <BrowserRouter>
            <Switch>
              <Route path="/login" component={this.withPropsLogin}  />
              <Route exact path="/chat" component={this.withPropsChat} />
              <Route exact path="/" component={this.withPropsLogin} />
            </Switch>
          </BrowserRouter>
        
      </div>
    );
  }


  private withPropsLogin = (props: any) => {
    return (<Login 
      settingStore={settingStore}
      isLoggedIn={this.state.isLoggedIn} 
      {...props}  />);
  }
  private withPropsChat = (props: any) => {
    return (<Chat settingStore={settingStore} />)
  }

}





export default App;
