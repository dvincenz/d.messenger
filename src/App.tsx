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

  private seedSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // todo: check seed validity
    // todo: redirect
    this.setState({
      isLoggedIn: true,
    })
  }

  private withPropsLogin = (props: any) => {
    return (<Login 
      seedCallback={this.seedSave} 
      seed={this.state.seed} 
      handleInputChanges={this.handleInputChanges}
      isLoggedIn={this.state.isLoggedIn} 
      {...props}  />);
  }
  private withPropsChat = (props: any) => {
    return (<Chat seed={this.state.seed} />)
  }

  private handleInputChanges = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      seed: event.target.value
    })
  }
}





export default App;
