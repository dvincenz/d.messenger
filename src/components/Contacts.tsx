import * as React from 'react';
import { StyleRulesCallback, withStyles, Avatar, ListItem, ListItemText, List } from '@material-ui/core';


const styles: StyleRulesCallback = theme => ({ 
    contact: {
        backgroundColor: '#aacbff'
    },
    avatar: {
        color: '#FFFFFF',
        backgroundColor: '#f50057'
    },
    list:{
        overflow: 'hidden',
        width: '280px',
    }
});


interface IProps {
    classes: any;
    iotaApi: any;
}

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
                    <Person {...this.props} name="Dumeni" address="LKVQLLCIWSFNRIY9YOHFNAMGHEZTPUEWDPWJWMCE9PRHMVWKIOPRCIMMTPCKEQH9GBQPKUNDBMODMMDMYNNISEAPYY" />
                    <Person {...this.props} name="Fancy" address="OPRCIMMTPCKEQH9GBQPKUNDBMODMMDMYNNISEAPYYLKVQLLCIWSFNRIY9YOHFNAMGHEZTPUEWDPWJWMCE9PRHMVWKI" />
                </List>    
            </React.Fragment>
        );
    }

    protected getContacts = () => {
        this.props.iotaApi.getContacts();
    }
}


function Person (props: any){
    return(
        <ListItem button>
            <Avatar className={props.classes.avatar}>{(props.name).charAt(0)}</Avatar>
            <ListItemText primary={props.name} secondary={props.address} />
        </ListItem>
        
    )
} 

export const Contacts = withStyles(styles)(ContactsComponent);