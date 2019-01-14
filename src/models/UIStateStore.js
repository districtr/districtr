export default class UIStateStore {
    constructor(reducer, initialState) {
        this.reducer = reducer;
        this.state = initialState;
        this.subscribers = [];

        this.dispatch = this.dispatch.bind(this);
        this.subscribe = this.subscribe.bind(this);
    }
    dispatch(action) {
        const nextState = this.reducer(this.state, action);
        if (nextState !== this.state) {
            this.state = nextState;
            this.subscribers.forEach(subscriber =>
                subscriber(this.state, this.dispatch)
            );
        }
    }
    subscribe(subscriber) {
        this.subscribers.push(subscriber);
    }
}
