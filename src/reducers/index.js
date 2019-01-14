import { combineReducers } from "../utils";
import tabsReducer from "./tabs";

export const reducer = combineReducers({ tabs: tabsReducer });

export default reducer;
