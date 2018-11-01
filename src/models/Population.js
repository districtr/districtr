import Tally from "./Tally";

export default class Population {
    constructor(initialData, getPopulation, total) {
        this.tally = new Tally(getPopulation, initialData);
        this.total = total;
        this.ideal = total / this.tally.data.length;

        this.formattedIdeal = numberWithCommas(
            roundToDecimal(this.population.ideal, 2)
        );

        this.update = this.update.bind(this);
        this.deviations = this.deviations.bind(this);
    }
    update(feature, color) {
        this.tally.update(feature, color);
    }
    deviations() {
        return this.tally.data.map(
            d => Math.abs(d - this.population.ideal) / this.population.ideal
        );
    }
    maxDisplayValue() {
        return Math.max(this.maxDisplayValue, ...this.tally.data);
    }
}
