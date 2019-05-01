import { createActions, createReducer } from "../utils";

export const handlers = {
    changeTab: (state, action) => ({ ...state, activeTab: action.id }),
    selectTool: (state, action) => ({ ...state, activeTool: action.id }),
    openDropdownMenu: state => ({ ...state, dropdownMenuOpen: true }),
    closeDropdownMenu: state => ({ ...state, dropdownMenuOpen: false })
};

export const actions = createActions(handlers);

export default createReducer(handlers);
