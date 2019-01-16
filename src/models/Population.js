import { numberWithCommas, roundToDecimal } from "../utils";
import NumericalColumn from "./NumericalColumn";
import Tally from "./Tally";

export class PopulationSubgroup extends NumericalColumn {
    constructor({ population, ...args }) {
        super(args);

        if (population === undefined || population === null) {
            this.population = this;
        } else {
            this.population = population;
        }
    }
}

export default class Population {
    constructor(initialData, populationRecord) {
        this.total = new PopulationSubgroup(populationRecord.total);

        this.subgroups = populationRecord.subgroups.map(
            subgroup =>
                new PopulationSubgroup({ ...subgroup, population: this.total })
        );

        this.tally = new Tally(this.total.getValue, initialData);

        this.ideal = this.total.sum / initialData.length;
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
