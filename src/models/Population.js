import { numberWithCommas, roundToDecimal } from "../Charts/utils";
import Tally from "./Tally";

export default class Population {
    constructor(initialData, populationKey, total) {
        this.populationKey = populationKey;
        this.tally = new Tally(this.getPopulation, initialData);
        this.total = total;
        this.ideal = total / this.tally.data.length;

        this.formattedIdeal = numberWithCommas(roundToDecimal(this.ideal, 2));

        this.update = this.update.bind(this);
        this.getPopulation = this.getPopulation.bind(this);
        this.asMapboxExpression = this.asMapboxExpression.bind(this);
        this.deviations = this.deviations.bind(this);
        this.maxDisplayValue = this.maxDisplayValue.bind(this);
    }
    getPopulation(feature) {
        return parseFloat(feature.properties[this.populationKey]);
    }
    asMapboxExpression() {
        return ["to-number", ["get", this.populationKey]];
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
