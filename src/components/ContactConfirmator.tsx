import * as React from 'react';
import { Button, Typography, withStyles, LinearProgress } from "@material-ui/core";
import { contactStore, ContactStoreState } from 'src/stores/ContactStore';
import { observer } from 'mobx-react';
import { messageStore } from 'src/stores/MessageStore';

// tslint:disable:jsx-no-lambda
export const ContactConfirmator = withStyles((theme) => ({
    chatroom: {
        height: "100%",
        backgroundColor: '#e0e0e0',
        overflow: 'hidden',
        boxShadow: '0 0 8px 0 rgba(0,0,0, 0.3)'

    },
    contactRequest: {
        maxWidth: 780,
        backgroundColor: '#ffffff',
        padding: 20,
        paddingBottom: 60,
        marginTop: 20,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    buttonsContainer: {
        width: '100%',
    },
    buttons: {
        marginLeft: 20,
        float: 'right'
    },
    loader:{
        height:3,
        marginTop:-3,
        marginLeft:-2,
    }
}))(observer((props: any) => {
    if (contactStore.currentContact === undefined) {
        return (<p>error get contact :-(</p>)
    }else{
        // tslint:disable-next-line:no-unused-expression
        messageStore.getMessagesFromAddress
    }
    const loading = contactStore.state === ContactStoreState.loading;
    
    return (
        <React.Fragment>
            <main className={props.classes.chatroom}>
                <div className={props.classes.contactRequest}>
                    <Typography variant="display1" align="center" color="primary" gutterBottom>
                        contact request from {contactStore.currentContact.name}
                    </Typography>
                    <Typography variant="body2" align="center" color="textSecondary" paragraph>
                        {contactStore.currentContact.name} with the address {contactStore.currentContact.address} likes to communication with you over d.messenger. You can reject or accept the request.
                </Typography>
                    <div className={props.classes.buttonsContainer}>
                        
                        <Button className={props.classes.buttons} disabled={loading} variant="contained" color="primary" onClick={() => contactStore.acceptCurrentContact()}>Accept</Button>
                        <Button className={props.classes.buttons} disabled={loading} color="secondary" onClick={() => contactStore.rejectCurrentContact()}>Reject</Button>
                    </div>
                </div>
            </main>
            {loading && <LinearProgress className={props.classes.loader}  color="secondary" />}
        </React.Fragment>
    )
}));


