import { createActions, createReducer, replace } from "../utils";

export const handlers = {
    toggleOpen: (state, action) => ({
        ...state,
        [action.chart]: {
            ...state[action.chart],
            isOpen: !state[action.chart].isOpen
        }
    }),
    addChart: (state, action) => ({
        ...state,
        [action.chart]: {
            isOpen: action.isOpen === undefined ? true : action.isOpen,
            activeSubgroupIndices: action.activeSubgroupIndices
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
