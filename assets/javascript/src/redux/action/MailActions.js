import {
    FETCH_MAIL_ACCOUNTS,
    SUCCESS_FETCH_MAIL_ACCOUNTS,
} from "../actionType/actionType"
import Api from "../api/api";

export const fetchMailAccounts = () => {
    return {
        type:  FETCH_MAIL_ACCOUNTS,
    }
}

export const successFetchMailAccounts = (payload) => {
    return {
        type: SUCCESS_FETCH_MAIL_ACCOUNTS,  
        payload
    }
}

export const fetchEmailsAction = (Loginuser) => {
    // return function (dispatch) {
    //     Api.LoginApi(Loginuser).then(result => {
    //         const token = result.data.token;
    //         localStorage.setItem('access_token', token)
    //         console.log(token)
    //         dispatch(successFetchMailAccounts(result.data))
    //     }).catch(err => {
    //         console.log(err)
    //     })
    // }
}
