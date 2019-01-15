import { numberWithCommas, roundToDecimal } from "../utils";
import Tally from "./Tally";

export class PopulationSubgroup {
    constructor({ name, key, max, min, population }) {
        this.name = name;
        this.key = key;
        this.max = max;
        this.min = min;
        this.population = population;
        this.asMapboxExpression = this.asMapboxExpression.bind(this);
    }
    asMapboxExpression() {
        return ["to-number", ["get", this.key]];
    }
}

export default class Population {
    constructor(initialData, populationSummary) {
        this.name = populationSummary.total.name;
        this.key = populationSummary.total.key;
        this.total = populationSummary.total.sum;
        this.min = populationSummary.total.min;
        this.max = populationSummary.total.max;
        this.ideal = this.total / initialData.length;

        this.getPopulation = this.getPopulation.bind(this);
        this.tally = new Tally(this.getPopulation, initialData);

        this.subgroups = populationSummary.subgroups.map(
            subgroup =>
                new PopulationSubgroup({ ...subgroup, population: this })
        );
        this.population = this;

        this.formattedIdeal = numberWithCommas(roundToDecimal(this.ideal, 2));

        this.bindMethods();
    }
    bindMethods() {
        this.update = this.update.bind(this);
        this.asMapboxExpression = this.asMapboxExpression.bind(this);
        this.deviations = this.deviations.bind(this);
        this.maxDisplayValue = this.maxDisplayValue.bind(this);
    }
    getPopulation(feature) {
        return parseFloat(feature.properties[this.key]);
    }
    asMapboxExpression() {
        return ["to-number", ["get", this.key]];
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
