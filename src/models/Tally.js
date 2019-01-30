import { zeros } from "../utils";

export default class Tally {
    constructor(dataAccessor, parts) {
        this.data = zeros(parts.length);
        this.accessor = dataAccessor;
        this.update = this.update.bind(this);
    }
    update(feature, color) {
        if (color !== undefined && color !== null) {
            this.data[color] += this.accessor(feature);
        }
        if (
            feature.state !== undefined &&
            feature.state.color !== undefined &&
            feature.state.color !== null
        ) {
            this.data[feature.state.color] -= this.accessor(feature);
        }
    }
}
