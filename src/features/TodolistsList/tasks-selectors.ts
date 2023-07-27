import {AppRootStateType} from "../../app/store";

export const tasksSelector = ((state: AppRootStateType) => state.tasks)
