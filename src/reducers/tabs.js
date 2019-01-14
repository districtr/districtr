import { createReducer } from "../utils";

export const handlers = {
    changeTab: (state, action) => ({ ...state, activeTab: action.id })
};

export default createReducer(handlers);
