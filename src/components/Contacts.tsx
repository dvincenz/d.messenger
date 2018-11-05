import * as React from 'react';
import { StyleRulesCallback, withStyles, Avatar, ListItem, ListItemText, List } from '@material-ui/core';
import { Link, Redirect } from 'react-router-dom';
import { contactStore } from '../stores/ContactStore'
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
        this.getContacts();
    }

    public render() {
        const { classes } = this.props
        return (
            <React.Fragment>
                <List className={classes.list}>
                    {contactStore.contacts.map(c => 
                        <Person key={c.address} contact={c} classes={classes}/>
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

    protected getContacts = () => {
        // this.props.iotaApi.getContacts();
    }
}


function Person(props: any) {
    const link = `/chat/${props.contact.address}`;
    return (
        // tslint:disable-next-line:jsx-no-lambda
        <Link to={link} className={props.classes.link}>
            <ListItem button>
                <Avatar className={props.classes.avatar}>{(props.contact.name).charAt(0)}</Avatar>
                <ListItemText primary={props.contact.name} secondary={props.contact.address} />
            </ListItem>
        </Link>
    )
}

export const Contacts = withStyles(styles)(ContactsComponent);