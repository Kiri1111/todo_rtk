import {
	AddTodolistActionType,
	RemoveTodolistActionType,
	SetTodolistsActionType,
	todolistsActions
} from './todolists-reducer'
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {appActions, SetAppErrorActionType, SetAppStatusActionType} from "../../app/app-reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: TasksStateType = {}

const slice = createSlice({
	name: 'tasks',
	initialState,
	reducers: {
		removeTaskAC: (state, action: PayloadAction<{ taskId: string, todolistId: string }>) => {
			const tasks = state[action.payload.todolistId]
			const indexTaskForDeleteId = tasks.findIndex(t => t.id === action.payload.taskId)
			if (indexTaskForDeleteId !== -1) {
				tasks.slice(indexTaskForDeleteId, 1)
			}
		},
		addTaskAC: (state, action: PayloadAction<{ task: TaskType }>) => {
			const tasks = state[action.payload.task.todoListId]
			tasks.unshift(action.payload.task)
		},
		updateTaskAC: (state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) => {
			const tasks = state[action.payload.todolistId]
			const indexTaskForUpdate = tasks.findIndex(t => t.id === action.payload.taskId)
			if (indexTaskForUpdate !== -1) {
				tasks[indexTaskForUpdate] = {...tasks[indexTaskForUpdate], ...action.payload.model}
			}
		},
		setTasksAC: (state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) => {
			state[action.payload.todolistId] = action.payload.tasks
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(todolistsActions.addTodolistAC, (state, action) => {
				state[action.payload.todolist.id] = []
			})
			.addCase(todolistsActions.removeTodolistAC, (state, action) => {
				delete state[action.payload.id]
			})
			.addCase(todolistsActions.setTodolistsAC, (state, action) => {
				action.payload.todolists.forEach(tl => state[tl.id] = [])
			})
	}

})

export const tasksReducer = slice.reducer
export const tasksActions = slice.actions

// export const _tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
// 	switch (action.type) {
// 		case 'REMOVE-TASK':
// 			return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id != action.taskId)}
// 		case 'ADD-TASK':
// 			return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
// 		case 'UPDATE-TASK':
// 			return {
// 				...state,
// 				[action.todolistId]: state[action.todolistId]
// 					.map(t => t.id === action.taskId ? {...t, ...action.model} : t)
// 			}
// case 'ADD-TODOLIST':
// 	return {...state, [action.todolist.id]: []}
// case 'REMOVE-TODOLIST':
// 	const copyState = {...state}
// 	delete copyState[action.id]
// 	return copyState
// case 'SET-TODOLISTS': {
// 	const copyState = {...state}
// 	action.todolists.forEach((tl: any) => {
// 		copyState[tl.id] = []
// 	})
// 	return copyState
// }
// case 'SET-TASKS':
// 	return {...state, [action.todolistId]: action.tasks}
// default:
// 	return state
// }
// }
//
// actions
// export const removeTaskAC = (taskId: string, todolistId: string) =>
// 	({type: 'REMOVE-TASK', taskId, todolistId} as const)
// export const addTaskAC = (task: TaskType) =>
// 	({type: 'ADD-TASK', task} as const)
// export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
// 	({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
// export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
// 	({type: 'SET-TASKS', tasks, todolistId} as const)

// thunks

export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch<ActionsType | SetAppStatusActionType>) => {
	dispatch(appActions.setAppStatusAC({status: 'loading'}))
	todolistsAPI.getTasks(todolistId)
		.then((res) => {
			const tasks = res.data.items
			dispatch(tasksActions.setTasksAC({tasks, todolistId}))
			dispatch(appActions.setAppStatusAC({status: 'succeeded'}))
		})
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
	todolistsAPI.deleteTask(todolistId, taskId)
		.then(res => {
			dispatch(tasksActions.removeTaskAC({taskId, todolistId}))
		})
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch<ActionsType | SetAppErrorActionType | SetAppStatusActionType>) => {
	dispatch(appActions.setAppStatusAC({status: 'loading'}))
	todolistsAPI.createTask(todolistId, title)
		.then(res => {
			if (res.data.resultCode === 0) {
				const task = res.data.data.item
				const action = tasksActions.addTaskAC({task})
				dispatch(action)
				dispatch(appActions.setAppStatusAC({status: 'succeeded'}))
			} else {
				handleServerAppError(res.data, dispatch);
			}
		})
		.catch((error) => {
			handleServerNetworkError(error, dispatch)
		})
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
	(dispatch: ThunkDispatch, getState: () => AppRootStateType) => {
		const state = getState()
		const task = state.tasks[todolistId].find(t => t.id === taskId)
		if (!task) {
			//throw new Error("task not found in the state");
			console.warn('task not found in the state')
			return
		}

		const apiModel: UpdateTaskModelType = {
			deadline: task.deadline,
			description: task.description,
			priority: task.priority,
			startDate: task.startDate,
			title: task.title,
			status: task.status,
			...domainModel
		}

		todolistsAPI.updateTask(todolistId, taskId, apiModel)
			.then(res => {
				if (res.data.resultCode === 0) {
					const action = tasksActions.updateTaskAC({taskId, model: domainModel, todolistId})
					dispatch(action)
				} else {
					handleServerAppError(res.data, dispatch);
				}
			})
			.catch((error) => {
				handleServerNetworkError(error, dispatch);
			})
	}

// types
export type UpdateDomainTaskModelType = {
	title?: string
	description?: string
	status?: TaskStatuses
	priority?: TaskPriorities
	startDate?: string
	deadline?: string
}
export type TasksStateType = {
	[key: string]: Array<TaskType>
}
type ActionsType =
	| ReturnType<typeof tasksActions.removeTaskAC>
	| ReturnType<typeof tasksActions.addTaskAC>
	| ReturnType<typeof tasksActions.updateTaskAC>
	| AddTodolistActionType
	| RemoveTodolistActionType
	| SetTodolistsActionType
	| ReturnType<typeof tasksActions.setTasksAC>

type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
