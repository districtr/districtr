import { combineReducers } from "../utils";
import electionsReducer from "./elections";
import tabsReducer from "./tabs";

export const reducer = combineReducers({
    tabs: tabsReducer,
    elections: electionsReducer
});

export default reducer;
