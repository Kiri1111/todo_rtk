import {Dispatch} from 'redux'
import {SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {authAPI, LoginParamsType} from '../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunk} from "../../app/store";

const initialState: InitialStateType = {
	isLoggedIn: false
}

const slice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setIsLoggedInAC: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
			state.isLoggedIn = action.payload.isLoggedIn
		}
	},
	extraReducers: {}
})

export const authReducer = slice.reducer
export const authActions = slice.actions

export const loginTC = (data: LoginParamsType): AppThunk => (dispatch) => {
	dispatch(setAppStatusAC('loading'))
	authAPI.login(data)
		.then(res => {
			if (res.data.resultCode === 0) {
				dispatch(authActions.setIsLoggedInAC({isLoggedIn: true}))
				dispatch(setAppStatusAC('succeeded'))
			} else {
				handleServerAppError(res.data, dispatch)
			}
		})
		.catch((error) => {
			handleServerNetworkError(error, dispatch)
		})
}
export const logoutTC = (): AppThunk => (dispatch) => {
	dispatch(setAppStatusAC('loading'))
	authAPI.logout()
		.then(res => {
			if (res.data.resultCode === 0) {
				dispatch(authActions.setIsLoggedInAC({isLoggedIn: false}))
				dispatch(setAppStatusAC('succeeded'))
			} else {
				handleServerAppError(res.data, dispatch)
			}
		})
		.catch((error) => {
			handleServerNetworkError(error, dispatch)
		})
}


type InitialStateType = {
	isLoggedIn: boolean
}

