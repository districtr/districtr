import { combineReducers } from "../utils";
import electionsReducer from "./elections";
import subgroupsReducer from "./subgroups";
import tabsReducer from "./tabs";

export const reducer = combineReducers({
    tabs: tabsReducer,
    elections: electionsReducer,
    subgroups: subgroupsReducer
});

export default reducer;
