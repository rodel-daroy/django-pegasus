import axios from '../../utils/axios'
import { sessionType } from '../../utils/Enums'
import { toastOnError, toastOnSuccess } from '../../utils/Utils'
import {
  GET_SENDING_CALENDARS,
  ADD_SENDING_CALENDAR,
  UPDATE_SENDING_CALENDAR,
  DELETE_SENDING_CALENDAR,
  GET_AVAILABLE_TIME_ZONES,
  SEND_TEST_EMAIL,
} from '../actionType/actionType'

export const getSendingCalendars = (
  session = sessionType.PERSONAL,
  adminId = null,
) => (dispatch) => {
  axios
    .get('/mailaccounts/sending-calendars/', {
      admin_id: adminId,
      session_type: session,
    })
    .then((response) => {
      dispatch({
        type: GET_SENDING_CALENDARS,
        payload: response.data,
      })
    })
    .catch((error) => {
      toastOnError(error)
    })
}

export const addSendingCalendar = (sendingCalendar) => (dispatch) => {
  axios
    .post('/mailaccounts/sending-calendars/', sendingCalendar)
    .then((response) => {
      dispatch({
        type: ADD_SENDING_CALENDAR,
        payload: response.data,
      })
      toastOnSuccess('Calendar added successfully!')
    })
    .catch((error) => {
      toastOnError(error)
    })
}

export const deleteSendingCalendar = (id) => (dispatch) => {
  axios
    .delete(`/mailaccounts/sending-calendars/${id}/`)
    .then((response) => {
      dispatch({
        type: DELETE_SENDING_CALENDAR,
        payload: id,
      })
      toastOnSuccess('Calendar deleted successfully!')
    })
    .catch((error) => {
      toastOnError(error)
    })
}

export const updateSendingCalendar = (id, sendingCalendar) => (dispatch) => {
  axios
    .patch(`/mailaccounts/sending-calendars/${id}/`, sendingCalendar)
    .then((response) => {
      dispatch({
        type: UPDATE_SENDING_CALENDAR,
        payload: response.data,
      })
      toastOnSuccess('Calendar updated successfully!')
    })
    .catch((error) => {
      toastOnError(error)
    })
}

export const getAvailableTimezones = () => (dispatch) => {
  axios
    .get('/mailaccounts/available-timezones/')
    .then((response) => {
      dispatch({
        type: GET_AVAILABLE_TIME_ZONES,
        payload: response.data,
      })
    })
    .catch((error) => {
      toastOnError(error)
    })
}

export const sendTestEmail = (mailAccountId) => (dispatch) => {
  console.log('sending test email...')

  axios
    .post('/mailaccounts/send-test-email/', { mailAccountId })
    .then((response) => {
      toastOnSuccess('Sent test email successfully!')
    })
    .catch((error) => {
      toastOnError(error)
    })
}
