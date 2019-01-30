import { createActions, createReducer, replace } from "../utils";

export const handlers = {
    selectSubgroup: (state, action) => ({
        ...state,
        activeSubgroupIndices: replace(
            state.activeSubgroupIndices,
            action.subgroupPosition,
            action.subgroupIndex
        )
    })
};

export const actions = createActions(handlers);

export default createReducer(handlers);
