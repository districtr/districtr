import { combineReducers } from "../utils";
import chartsReducer from "./charts";
import electionsReducer from "./elections";
import subgroupsReducer from "./subgroups";
import tabsReducer from "./tabs";

export const reducer = combineReducers({
    tabs: tabsReducer,
    elections: electionsReducer,
    subgroups: subgroupsReducer,
    charts: chartsReducer
});

export default reducer;
