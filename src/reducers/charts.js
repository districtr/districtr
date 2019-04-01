import { createActions, createReducer, replace } from "../utils";

export const handlers = {
    toggleOpen: (state, action) => ({
        ...state,
        [action.chart]: {
            ...state[action.chart],
            isOpen: !state[action.chart].isOpen
        }
    }),
    selectSubgroup: (state, action) => ({
        ...state,
        [action.chart]: {
            ...state[action.chart],
            activeSubgroupIndices: replace(
                state[action.chart].activeSubgroupIndices,
                action.subgroupPosition,
                action.subgroupIndex
            )
        }
    })
};

export const actions = createActions(handlers);

export default createReducer(handlers);
