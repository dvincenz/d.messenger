import * as React from 'react';
import { StyleRulesCallback, withStyles, Avatar, ListItem, ListItemText, List, Divider } from '@material-ui/core';
import { Link, Redirect } from 'react-router-dom';
import { contactStore } from '../stores/ContactStore'
import { observer } from 'mobx-react';
import { ChatStatus } from 'src/entities/WebRTCConnection';


const styles: StyleRulesCallback = theme => ({
    contact: {
        backgroundColor: '#aacbff'
    },
    avatar: {
        color: '#FFFFFF',
        backgroundColor: '#f50057'
    },
    avatarActive: {
        color: '#FFFFFF',
        backgroundColor: '#00a02a'
    },
    list: {
         width: '280px',
    },
    link: {
        textDecoration: 'none',
    },
    secondary: {
        wordBreak: 'break-all',
        fontSize: '8.5px',
    },
});


interface IProps {
    classes: any;
}

@observer
class ContactsComponent extends React.Component<IProps> {
    constructor(props: IProps) {
        super(props)
    }

    public render() {
        const { classes } = this.props
        return (
            <React.Fragment>
                <List className={classes.list}>
                    {contactStore.getContacts.map(c =>
                        !c.isGroup && <Person key={c.address} contact={c} classes={classes} handleClickContact={this.handleClickContact}/>
                    )}
                </List>
                <Divider />
                <List className={classes.list}>
                    {contactStore.getContacts.map(c =>
                        c.isGroup && <Person key={c.address} contact={c} classes={classes} handleClickContact={this.handleClickContact}/>
                    )}
                </List>
            </React.Fragment>
        );
    }
    protected redirect = (address: string) => {
        const link = `/chat/${address}`
        return (  
            <Redirect to={link} />
        ) 
    }

    protected handleClickContact = () => {
        // todo: handle this click
    }
}


const Person = observer((props: any) => {
    const link = `/chat/${props.contact.address}`;
    return (
        // tslint:disable-next-line:jsx-no-lambda
        <Link to={link} onClick={props.handleClickContact} className={props.classes.link}>
            <ListItem button>
                <Avatar className={props.contact.status === ChatStatus.offline ? props.classes.avatar : props.classes.avatarActive}>{props.contact.name && (props.contact.name).charAt(0).toLocaleUpperCase()}</Avatar>
               <ListItemText 
                classes={{ secondary: props.classes.secondary }}
                primary={props.contact.name} 
                secondary={props.contact.address} />
            </ListItem>
        </Link>
    )
})

export const Contacts = withStyles(styles)(ContactsComponent);