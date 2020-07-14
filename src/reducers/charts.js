import { createActions, createReducer, replace } from "../utils";

export const handlers = {
    toggleOpen: (state, action) => ({
        ...state,
        [action.chart]: {
            ...state[action.chart],
            isOpen: !state[action.chart].isOpen
        }
    }),
    openChart: (state, action) => ({
        ...state,
        [action.chart]: {
            ...state[action.chart],
            isOpen: true
        }
    }),
    addChart: (state, action) => ({
        ...state,
        [action.chart]: {
            isOpen: action.isOpen === undefined ? true : action.isOpen,
            activeSubgroupIndices: action.activeSubgroupIndices,
            activePartIndex: action.activePartIndex
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
    }),
    selectPart: (state, action) => ({
        ...state,
        [action.chart]: {
            ...state[action.chart],
            activePartIndex: action.partIndex
        }
    }),
    selectAgeView: (state, action) => ({
        ...state,
        [action.chart]: {
            ...state[action.chart],
            ageView: action.ageView
        }
    })
};

export const actions = createActions(handlers);

export default createReducer(handlers);
