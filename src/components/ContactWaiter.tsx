import * as React from 'react';
import { Typography, withStyles } from "@material-ui/core";
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

// tslint:disable:jsx-no-lambda
export const ContactWaiter = withStyles((theme) => ({
    icon:{
        margin: '0 auto',
        width: '100%',
        fontSize: '80px',

    },
    errorText:{
        fontSize: '20px',
        color: 'rgba(160, 160, 160, 0.87)'
    },
    root: {
        color: 'rgba(160, 160, 160, 0.87)',
        textAlign: 'center',
        marginTop: '30px'
    }
}))((props: any) => {
    return (
        <div className={props.classes.root}>
            <QuestionAnswerIcon className={props.classes.icon} />
            <Typography className={props.classes.errorText}>
                Waiting for approval
                </Typography>
        </div>
    )
});


