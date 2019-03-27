import { divideOrZeroIfNaN } from "../utils";
import NumericalColumn from "./NumericalColumn";
import Tally from "./Tally";

export default class ColumnSet {}

export class Subgroup extends NumericalColumn {
    constructor({ total, parts, ...args }) {
        super(args);

        this.total = total || this;
        this.tally = new Tally(this.getValue, parts);
    }
    getFraction(feature) {
        return this.getValue(feature) / this.total.getValue(feature);
    }
    fractionAsMapboxExpression() {
        return divideOrZeroIfNaN(
            this.asMapboxExpression(),
            this.total.asMapboxExpression()
        );
    }
}
