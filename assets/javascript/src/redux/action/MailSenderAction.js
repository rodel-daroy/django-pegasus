import {
    FAILURE_MAIL_SENDER,
    REQUEST_FOR_MAIL_SENDER,
    SUCCESS_MAIL_SENDER,
    FAILURE_MAIL_GET_DATA,
    REQUEST_FOR_MAIL_GET_DATA,
    SUCCESS_MAIL_GET_DATA,
    SUCCESS_MAIL_ACCOUNT_DELETE,
    SUCCESS_MAIL_ACCOUNT_UPDATE,
    FAILURE_MAIL_ACCOUNT_UPDATE
} from "../actionType/actionType"
import Api from "../api/api"
export const MailSenderSuccess = (mailData) => {
    return {
        type: SUCCESS_MAIL_SENDER,
        mailData
    }
}
// DATA
export const MailGetDataSuccess = (payload) => {
    return {
        type: SUCCESS_MAIL_GET_DATA,
        payload
    }
}
export const MailGetDataFailure = () => {
    return {
        type: FAILURE_MAIL_GET_DATA,
    }
}
// DELETE MAIL ACCOUNT 
export const deleteMailAccountSuccess= () => {
    return {
        type: SUCCESS_MAIL_ACCOUNT_DELETE,
    }
}
// MAIL ACCOUNT UPDATE
export const updateMailAccountSuccess= () => {
    return {
        type: SUCCESS_MAIL_ACCOUNT_UPDATE,
    }
}
export const updateMailAccountFailure= () => {
    return {
        type: FAILURE_MAIL_ACCOUNT_UPDATE,
    }
}



// ADD MAIL ACCOUNT
export const MailSenderAction = (mailData) => {
    return function (dispatch) {
        const token = localStorage.getItem('access_token')
        Api.MailSenderApi(mailData, token).then(result => {
            dispatch(MailSenderSuccess('result', result.data))
            dispatch(MailGetDataAction());
        }).catch(err => {
            console.log(err)
        })
    }
}
// GET DATA
export const MailGetDataAction = () => {
    return function (dispatch) {
        const token = localStorage.getItem('access_token')
        Api.MailGetDataApi(token).then(result => {
            dispatch(MailGetDataSuccess(result.data.message))
        }).catch(err => {
            console.log(err)
        })
    }
}
// DELETE
export const MailAccountDeleteAction = (id) => {
    return function (dispatch) {
        const token = localStorage.getItem('access_token')
        Api.MailAccountDelete(token,id).then(result => {
            console.log(result,"results")
            dispatch(deleteMailAccountSuccess())
            dispatch(MailGetDataAction());
        }).catch(err => {
            console.log(err,'error')
        })
    }
}
// UPDATE
export const MailAccountUpdate=(data,id)=>{
  return function(dispatch){
      const token = localStorage.getItem('access_token')
      Api.MailAccountUpdateApi(token,data,id)
      .then((reslut)=>{
          console.log(reslut,'result')
          dispatch(updateMailAccountSuccess)
          dispatch(MailGetDataAction())
      })
      .catch(err=>{
          console.log(err,"error")
          dispatch(updateMailAccountFailure)
      })
  }
}