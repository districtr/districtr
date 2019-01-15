import { createActions, createReducer } from "../utils";

export const handlers = {
    changeTab: (state, action) => ({ ...state, activeTab: action.id })
};

export const actions = createActions(handlers);

export default createReducer(handlers);
