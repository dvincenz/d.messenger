import * as React from 'react';
import { StyleRulesCallback, withStyles } from '@material-ui/core';


const styles: StyleRulesCallback = theme => ({ 
    contact: {
        backgroundColor: '#aacbff'
    },
});


class ContactsComponent extends React.Component<{}> {
    constructor(props: {}) {
        super(props)
    }

    public render() {
        return (
            <div>
                <p>show all contacts</p>
            </div>
        );
    }
}


export const Contacts = withStyles(styles)(ContactsComponent);