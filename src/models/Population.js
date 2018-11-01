import { numberWithCommas, roundToDecimal } from "../Charts/utils";
import Tally from "./Tally";

export default class Population {
    constructor(initialData, getPopulation, total) {
        this.tally = new Tally(getPopulation, initialData);
        this.total = total;
        this.ideal = total / this.tally.data.length;

        this.formattedIdeal = numberWithCommas(roundToDecimal(this.ideal, 2));

        this.update = this.update.bind(this);
        this.deviations = this.deviations.bind(this);
        this.maxDisplayValue = this.maxDisplayValue.bind(this);
    }
    update(feature, color) {
        this.tally.update(feature, color);
    }
    deviations() {
        return this.tally.data.map(d => Math.abs(d - this.ideal) / this.ideal);
    }
    maxDisplayValue() {
        return Math.max(this.ideal * 2, ...this.tally.data);
    }
}
