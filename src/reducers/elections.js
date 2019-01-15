import { createActions, createReducer } from "../utils";

export const handlers = {
    changeElection: (state, action) => ({
        ...state,
        activeElectionIndex: action.index
    })
};

export const actions = createActions(handlers);

export default createReducer(handlers);
