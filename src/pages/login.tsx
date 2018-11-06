import * as React from 'react';
import {
  AppBar,
  Button,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  Grid,
  StyleRulesCallback,
  TextField,
  Toolbar,
  Typography,
  withStyles,
} from '@material-ui/core';
import { Redirect } from 'react-router';
import { observer } from 'mobx-react';
import { settingStore } from '../stores/SettingStore';
import { getRandomSeed } from "../utils";
import { NewAccountDialog } from "../components/NewAccountDialog";


const styles: StyleRulesCallback = theme => ({
  appBar: {
    position: 'relative',
  },
  icon: {
    marginRight: theme.spacing.unit * 2,
  },
  heroUnit: {
    backgroundColor: theme.palette.background.paper,
  },
  heroContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`,
  },
  heroButtons: {
    marginTop: theme.spacing.unit * 4,
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
      width: 1100,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing.unit * 6,
  },
  gray: {
    color: 'gray',
  },
  register: {
    marginTop: 50,
    padding: 25,
    backgroundColor: '#F5F5F5'
    ,
  },
  seedTextbox:{
    width: '100%'
  }
});

interface IPorps {
  classes: any;
}

interface IState {
  seed: string;
  isNewAccountDialogShow: boolean;
  textbox: any;
}

@observer
class LoginComponent extends React.Component<IPorps, IState> {
  
  constructor(props: IPorps) {
    super(props);
    this.state = {
      seed: '',
      isNewAccountDialogShow: false,
      textbox: null,
    }
  }

  public render() {
    const {classes} = this.props;
    if (settingStore.seed !== '') {
      return <Redirect to={{pathname: '/chat'}}/>;
    }
    return (
      <React.Fragment>
        <CssBaseline/>
        <AppBar position="static" className={classes.appBar}>
          <Toolbar>
            <Typography component="h6" color="inherit" noWrap>
              d.messanger - Distributed Messenger <span
              className={classes.gray}>(Alpha Version - use at your own risk)</span>
            </Typography>
          </Toolbar>
        </AppBar>
        <main>
          <div className={classes.heroUnit}>
            <div className={classes.heroContent}>
              <Typography variant="display3" align="center" color="primary" gutterBottom>
                d.messenger
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary" paragraph>
                d.messenger is a distributed messenger, which save all messages in the iota tangle network. No
                centralized unit is is required, this page is a static page and use only a connection with a node in the
                tangle network to be able to communicate.
              </Typography>
              <div className={classes.heroButtons}>
                <form onSubmit={this.handleStoreSeed}>
                  <Grid container spacing={16} justify="center">
                    <Grid item>
                      <TextField value={this.state.seed} inputProps={{size: 81}} type="password" label="Seed"
                                 onChange={this.handleSeedChange}/>
                    </Grid>
                  </Grid>
                  <Grid container spacing={16}>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Checkbox value="save your seed in your browser" color="primary"/>
                        }
                        label="save your seed in your browser"
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={16} justify="flex-end">
                    <Grid item>
                      <Button type="submit" variant="contained" color="primary">
                        Login with your Seed
                      </Button>
                    </Grid>
                  </Grid>
                </form>
                <div className={classes.register}>
                  <Typography variant="body2" align="center" color="textSecondary" paragraph>
                    You can register with enter your name, your browser will generate localy an seed that you can user
                    in the feature to access your chat.
                  </Typography>
                  <Grid container spacing={16} justify="center">
                    <Grid item>
                      <TextField label="Enter username"/>
                    </Grid>
                    <Grid item>
                      <Button variant="outlined" color="primary" onClick={this.handleNewContact}>
                        Create a new account
                      </Button>
                      {this.state.isNewAccountDialogShow && 
                      <NewAccountDialog 
                        handleSeedChange={this.handleSeedChange}
                        classes={this.props.classes} 
                        open 
                        handleClose={this.handleNewAccountDialogClose} 
                        seed={this.state.seed}/>}
                    </Grid>
                  </Grid>
                </div>
              </div>
            </div>
          </div>
        </main>
        <footer className={classes.footer}>
          <Typography align="center" color="textSecondary" component="p">
            You can find d.messanger on <a href="https://github.com/dvincenz/d.messenger" target="_blank">github</a>,
            feel free to contibute to this opensource project.
          </Typography>
        </footer>
      </React.Fragment>
    );
  }

  private handleSeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      seed: event.target.value,
      textbox: event.target
    })
    
  }

  private handleStoreSeed = () => {
    settingStore.setSeed(this.state.seed);
  }

  private handleNewContact = () => {
    // TODO: add handling for the username
    this.setState({
      seed: getRandomSeed(),
      isNewAccountDialogShow: true
    })
  }

  private handleNewAccountDialogClose = () => {
    this.state.textbox.select();
    document.execCommand("copy");
    this.setState({
      isNewAccountDialogShow: false
    })
    settingStore.setSeed(this.state.seed);
  }
}

export const Login = withStyles(styles)(LoginComponent);

