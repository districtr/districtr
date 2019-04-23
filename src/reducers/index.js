import { combineReducers } from "../utils";
import chartsReducer from "./charts";
import electionsReducer from "./elections";
import toolbarReducer from "./toolbar";

export const reducer = combineReducers({
    toolbar: toolbarReducer,
    elections: electionsReducer,
    charts: chartsReducer
});

export default reducer;
