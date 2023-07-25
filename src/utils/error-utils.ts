import {ResponseType} from '../api/todolists-api'
import {Dispatch} from 'redux'
import {appActions, SetAppErrorActionType, SetAppStatusActionType} from "../app/app-reducer";

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch<SetAppErrorActionType | SetAppStatusActionType>) => {
	if (data.messages.length) {
		dispatch(appActions.setAppErrorAC({error: data.messages[0]}))
	} else {
		dispatch(appActions.setAppErrorAC({error: 'Some error occurred'}))
	}
	dispatch(appActions.setAppStatusAC({status: 'failed'}))
}

export const handleServerNetworkError = (error: { message: string }, dispatch: Dispatch<SetAppErrorActionType | SetAppStatusActionType>) => {
	dispatch(appActions.setAppErrorAC({error: error.message ? error.message : 'Some error occurred'}))
	dispatch(appActions.setAppStatusAC({status: 'failed'}))
}
