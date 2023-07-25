import {appActions, appReducer, InitialStateType} from './app-reducer'

let startState: InitialStateType;

beforeEach(() => {
	startState = {
		error: null,
		status: 'idle',
		isInitialized: false
	}
})

test('correct error message should be set', () => {
	const endState = appReducer(startState, appActions.setAppErrorAC({error: 'some error'}))
	expect(endState.error).toBe('some error');
})

test('correct status should be set', () => {
	const endState = appReducer(startState, appActions.setAppStatusAC({status: 'loading'}))
	expect(endState.status).toBe('loading');
})

