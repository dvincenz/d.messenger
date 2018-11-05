import * as React from 'react';
import { StyleRulesCallback, withStyles, Avatar, ListItem, ListItemText, List } from '@material-ui/core';
import { Link, Redirect } from 'react-router-dom';
import { contactStore } from '../stores/ContactStore'
import { groupStore} from "../stores/GroupStore";
import { observer } from 'mobx-react';


const styles: StyleRulesCallback = theme => ({
    contact: {
        backgroundColor: '#aacbff'
    },
    avatar: {
        color: '#FFFFFF',
        backgroundColor: '#f50057'
    },
    list: {
        overflow: 'hidden',
        width: '280px',
    },
    link: {
        textDecoration: 'none',
    }
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
                        <Person key={c.address} contact={c} classes={classes} handleClickContact={this.handleClickContact}/>
                    )}
                    {groupStore.getGroups.map(g =>
                        <Group key={g.address} contact={g} classes={classes} handleClickGroup={this.handleClickContact}/>
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


function Person(props: any) {
    const link = `/chat/${props.contact.address}`;
    props.state.isGroup = false;
    return (
        // tslint:disable-next-line:jsx-no-lambda
        <Link to={link} onClick={props.handleClickContact} className={props.classes.link}>
            <ListItem button>
                <Avatar className={props.classes.avatar}>{(props.contact.name).charAt(0)}</Avatar>
                <ListItemText primary={props.contact.name + ' ' + props.contact.secret} secondary={props.contact.address} />
            </ListItem>
        </Link>
    )
}

function Group(props: any) {
    const link = `/chat/${props.contact.address}/isGroup`;
    props.state.isGroup = true;
    return (
        // tslint:disable-next-line:jsx-no-lambda
        <Link to={link} onClick={props.handleClickContact} className={props.classes.link}>
            <ListItem button>
                <Avatar className={props.classes.avatar}>{(props.contact.name).charAt(0)}</Avatar>
                <ListItemText primary={props.contact.name} secondary={props.contact.address} />
            </ListItem>
        </Link>
    )
}

export const Contacts = withStyles(styles)(ContactsComponent);