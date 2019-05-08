import { numberWithCommas, roundToDecimal } from "../utils";
import ColumnSet from "./ColumnSet";

export default class Population extends ColumnSet {
    constructor({ name, subgroups, total, parts }) {
        super({ subgroups, total, parts });
        this.name = name;

        this.ideal = this.total.sum / parts.length;
        this.formattedIdeal = numberWithCommas(roundToDecimal(this.ideal, 2));

        this.update = this.update.bind(this);
        this.deviations = this.deviations.bind(this);
    }
    deviations() {
        return this.total.data.map(d => (d - this.ideal) / this.ideal);
    }
    /**
     * Returns the indices of all subgroups with more than 5% of the total
     * population, sorted largest-to-smallest.
     */
    indicesOfMajorSubgroups() {
        return (
            this.subgroups
                .map((subgroup, i) => i)
                // .filter(i => this.subgroups[i].sum > this.total.sum * 0.05)
                .sort((i, j) => this.subgroups[j].sum - this.subgroups[i].sum)
                .slice(0, 3)
        );
    }
}
