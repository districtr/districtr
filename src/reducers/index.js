import { combineReducers } from "../utils";
import chartsReducer from "./charts";
import electionsReducer from "./elections";
import tabsReducer from "./tabs";

export const reducer = combineReducers({
    tabs: tabsReducer,
    elections: electionsReducer,
    charts: chartsReducer
});

export default reducer;
