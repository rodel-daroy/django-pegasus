import{
    REQUEST_FOR_GET_SCHEDULE,
    SUCCESS_GET_SCHEDULE,
    FAILURE_GET_SCHEDULE,
    UPDATE_SUCCESS_GET_SCHEDULE,
}from "../../redux/actionType/actionType"

import Api from "../api/api"

// GET SCHEDULE
export const FetchSchedule=()=>{
    return {
        type:REQUEST_FOR_GET_SCHEDULE
    }
}
export const FetchScheduleSuccess = (ScheduleGetData) => {
    return {
        type: SUCCESS_GET_SCHEDULE,
        payload: ScheduleGetData
    }
}
export const FetchScheduleFailure=()=>{
    return {
        type: FAILURE_GET_SCHEDULE
    }
}

// UPDATE SCHEDULE

export const UpdateScheduleSuccess = (UpdateScheduleData) => {
    console.log("in schedue updte action.js file ",UpdateScheduleData)
    return {
        type: UPDATE_SUCCESS_GET_SCHEDULE,
        payload: UpdateScheduleData
    }
}


// MIDDLEWARE FOR GET SCHEDULE
export const GetScheduleAction = () => {
    // console.log("ScheduleGetData",ScheduleGetData)
    return function (dispatch) {
        const token = localStorage.getItem('access_token')
        Api.GetScheduleApi(token).then(result => {
            dispatch(FetchScheduleSuccess(result.data))
            console.log("checking for schedule get data in MIDDLEWARE", result.data)
        }).catch(err => {
            console.log(err)
        })
    }
}
// MIDLEWARE FOR UPDATE SCHEDULE
export const ScheduleUpdateAction = (updatedataschedule) => {
    console.log("ScheduleGetDataaaaaaaaaaaaaaaaaaaa",updatedataschedule)
    return function (dispatch) {
        const token = localStorage.getItem('access_token')
        Api.UpdateScheduleApi(updatedataschedule,token).then(result => {
            dispatch(UpdateScheduleSuccess(result.data))
            console.log("checking for schedule update data in MIDDLEWARE", result.data)
        }).catch(err => {
            console.log(err)
        })
    }
}
