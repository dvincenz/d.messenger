import * as React from 'react';
import { AppBar, Toolbar, Typography, withStyles, StyleRulesCallback, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Avatar, IconButton, Tooltip } from '@material-ui/core';
import { settingStore } from 'src/stores/SettingStore';
import { observer } from 'mobx-react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { contactStore } from 'src/stores/ContactStore';
import { ChatStatus } from 'src/entities/WebRTCConnection';

interface IPorps {
    classes: any;
}

interface IState {
    expanded: boolean
}

const styles: StyleRulesCallback = theme => ({
    appBar: {
        position: 'relative',
        paddingLeft:0,
    },
    myContact: {
        width: 300,
        float: 'left',
        position: 'relative',
    },
    myContactExtensionPanel: {
        backgroundColor: "#3f51b5",
        boxShadow: "none",
    },
    contact: {
        flexGrow: 1,
        paddingLeft: 20
    },
    menu: {
        display: "flex",
    },
    myAddress: {
        wordBreak: "break-all",
        position: "absolute",
        top: "100%",
        backgroundColor: "#e0e0e0",
    },
    myAddressDisabled:{
        display: "none"
    },
    toolbar:{
        paddingLeft:0,
    },
    heading:{
        color:"white",
    },
    button:{
        color: "white"
    },
    smallText:{
        fontSize:10,
    },
    avatar: {
        color: '#FFFFFF',
        backgroundColor: '#f50057'
    },
    avatarActive: {
        color: '#FFFFFF',
        backgroundColor: '#00a02a'
    },
    float:{
        float: "left",
        paddingRight: 20,
    }

})

@observer
class TitleBaarComponent extends React.Component<IPorps, IState> {
    constructor(props: IPorps) {
        super(props);
        this.state = {
            expanded: false,
        }
    }

    public render() {
        const { classes } = this.props
        const contact = contactStore.currentContact
        const status = contact !== undefined && !contact.isGroup ? contact.status >= 1 ? contact.status === 1 ? 'offline' : 'writes...' : 'online' : ''
        
        const renderStatus = (
            <span className={classes.smallText}>{status}</span>
        )

        return (
            <AppBar position="static" className={classes.appBar}>
                <Toolbar className={classes.toolbar}>
                    <div className={classes.myContact} color="inherit">
                        <ExpansionPanel className={classes.myContactExtensionPanel} expanded={this.state.expanded} onChange={this.handleChange}>
                            <ExpansionPanelSummary expandIcon={
                                <Tooltip title='show my address'>
                                    <ExpandMoreIcon className={classes.button} />
                                </Tooltip>
                                }>
                                <Typography className={classes.heading}>{settingStore.myName}</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className={this.state.expanded ? classes.myAddress : classes.myAddressDisabled}>
                                <Typography>
                                    <span className={classes.smallText}>
                                        your personal address:
                                </span> <br />
                                    {settingStore.myAddress}
                                </Typography>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    </div>
                    <div className={classes.contact} color="inherit">
                        <div className={classes.float}>{contact !== undefined && <Avatar className={contact.status === ChatStatus.offline ? classes.avatar : classes.avatarActive}>{(contact.name).charAt(0).toLocaleUpperCase()}</Avatar>}</div>
                        <div className={classes.float}>{contact !== undefined && contact.name}<br /> {renderStatus}</div>
                    </div>
                    <div>
                        <IconButton onClick={this.logout}>
                            <Tooltip title="Logout">
                                <ExitToAppIcon className={classes.button} />
                            </Tooltip>
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>

        )
    }

    private handleChange = () => {
        this.setState({
          expanded: !this.state.expanded
        });
    };
    
    private logout = () => {
        window.sessionStorage.clear()
        window.localStorage.clear()
        settingStore.seed = ''
    }
}

export const TitleBaar = withStyles(styles)(TitleBaarComponent);

