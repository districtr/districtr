import { createActions, createReducer } from "../utils";

export const handlers = {
    toggleOpen: (state, action) => ({
        ...state,
        [action.chart]: {
            ...state[action.chart],
            isOpen: !state[action.chart].isOpen
        }
    })
};

export const actions = createActions(handlers);

export default createReducer(handlers);
