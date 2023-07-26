import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {handleServerNetworkError} from '../../utils/error-utils'
import {AppThunk} from '../../app/store';
import {appActions, RequestStatusType, SetAppErrorActionType, SetAppStatusActionType} from "../../app/app-reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
	name: 'todoList',
	initialState,
	reducers: {
		removeTodolistAC: (state, action: PayloadAction<{ id: string }>) => {
			const index = state.findIndex(el => el.id === action.payload.id)
			if (index !== -1) {
				state.splice(index, 1)
			}
		},
		addTodolistAC: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
			state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
		},
		changeTodolistTitleAC: (state, action: PayloadAction<{ id: string, title: string }>) => {
			const index = state.findIndex(el => el.id === action.payload.id)
			if (index !== -1) {
				state[index].title = action.payload.title
			}
		},
		changeTodolistFilterAC: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
			const index = state.findIndex(el => el.id === action.payload.id)
			if (index !== -1) {
				state[index].filter = action.payload.filter
			}
		},
		changeTodolistEntityStatusAC: (state, action: PayloadAction<{ id: string, status: RequestStatusType }>) => {
			const index = state.findIndex(el => el.id === action.payload.id)
			if (index !== -1) {
				state[index].entityStatus = action.payload.status
			}
		},
		setTodolistsAC: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
			return action.payload.todolists.map(el => ({...el, filter: 'all', entityStatus: 'idle'}))
		},
	}
})

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions

export const fetchTodolistsTC = (): AppThunk => {
	return (dispatch) => {
		dispatch(appActions.setAppStatusAC({status: 'loading'}))
		todolistsAPI.getTodolists()
			.then((res) => {
				dispatch(todolistsActions.setTodolistsAC({todolists: res.data}))
				dispatch(appActions.setAppStatusAC({status: 'succeeded'}))
			})
			.catch(error => {
				handleServerNetworkError(error, dispatch);
			})
	}
}
export const removeTodolistTC = (todolistId: string) => {
	return (dispatch: ThunkDispatch) => {
		dispatch(appActions.setAppStatusAC({status: 'loading'}))
		dispatch(todolistsActions.changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}))
		todolistsAPI.deleteTodolist(todolistId)
			.then((res) => {
				dispatch(todolistsActions.removeTodolistAC({id: todolistId}))
				dispatch(appActions.setAppStatusAC({status: 'succeeded'}))
			})
	}
}
export const addTodolistTC = (title: string): AppThunk => {
	return (dispatch) => {
		dispatch(appActions.setAppStatusAC({status: 'loading'}))
		todolistsAPI.createTodolist(title)
			.then((res) => {
				dispatch(todolistsActions.addTodolistAC({todolist: res.data.data.item}))
				dispatch(appActions.setAppStatusAC({status: 'succeeded'}))
			})
	}
}
export const changeTodolistTitleTC = (id: string, title: string) => {
	return (dispatch: Dispatch<ActionsType>) => {
		todolistsAPI.updateTodolist(id, title)
			.then((res) => {
				dispatch(todolistsActions.changeTodolistTitleAC({id, title}))
			})
	}
}

export type AddTodolistActionType = ReturnType<typeof todolistsActions.addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof todolistsActions.removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof todolistsActions.setTodolistsAC>;
type ActionsType =
	| RemoveTodolistActionType
	| AddTodolistActionType
	| ReturnType<typeof todolistsActions.changeTodolistTitleAC>
	| ReturnType<typeof todolistsActions.changeTodolistFilterAC>
	| SetTodolistsActionType
	| ReturnType<typeof todolistsActions.changeTodolistEntityStatusAC>
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
	filter: FilterValuesType
	entityStatus: RequestStatusType
}
type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
