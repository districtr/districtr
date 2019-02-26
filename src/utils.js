export function zeros(n) {
    let vector = [];
    for (let i = 0; i < n; i++) {
        vector.push(0);
    }
    return vector;
}

/**
 * Summarize an array of data. Returns `{min, max, total, length}`.
 *
 * @param {string or function} getter The string key of one of the feature's
 *  properties, or a function mapping each feature to the desired data.
 */
export function summarize(data) {
    return {
        min: Math.min(...data),
        max: Math.max(...data),
        total: sum(data),
        length: data.length
    };
}

// From https://stackoverflow.com/questions/2901102/
// how-to-print-a-number-with-commas-as-thousands-separators-in-javascript#2901298
export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function roundToDecimal(n, places) {
    return Math.round(n * Math.pow(10, places)) / Math.pow(10, places);
}

export function sum(values) {
    return values.reduce((total, value) => total + value, 0);
}

export function divideOrZeroIfNaN(x, y) {
    return ["case", [">", y, 0], ["/", x, y], 0];
}

export function extent(values) {
    return Math.min(...values) - Math.max(...values);
}

export function asPercent(value, total) {
    return `${Math.round(100 * (value / total))}%`;
}

export function replace(list, i, item) {
    return [...list.slice(0, i), item, ...list.slice(i + 1)];
}

// Light-weight redux implementation

export function createReducer(handlers) {
    return (state, action) => {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action);
        }
        return state;
    };
}

export function combineReducers(reducers) {
    return (state, action) => {
        let hasChanged = false;
        let nextState = {};

        for (let key in reducers) {
            nextState[key] = reducers[key](state[key], action);
            hasChanged = hasChanged || nextState[key] !== state[key];
        }

        return hasChanged ? nextState : state;
    };
}

export function createActions(handlers) {
    let actions = {};
    for (let actionType in handlers) {
        actions[actionType] = actionInfo => ({
            ...actionInfo,
            type: actionType
        });
    }
    return actions;
}

export function bindDispatchToActions(actions, dispatch) {
    let boundActions = {};
    for (let actionType in actions) {
        boundActions[actionType] = actionInfo =>
            dispatch(boundActions[actionType](actionInfo));
    }
    return boundActions;
}

/**
 * Handle HTTP responses by providing handlers for HTTP status codes.
 *
 * The `handlers` object should have handlers for each status code you want
 * to handle (e.g. 200, 500) as well as a "default" handler for all other
 * cases.
 *
 * @param {object} handlers
 */
export function handleResponse(handlers) {
    handlers = {
        default: resp => console.error("Request failed", resp),
        ...handlers
    };
    return response => {
        if (handlers.hasOwnProperty(response.status)) {
            return handlers[response.status](response);
        } else {
            return handlers.default(response);
        }
    };
}

export function isString(x) {
    return typeof x === "string" || x instanceof String;
}
