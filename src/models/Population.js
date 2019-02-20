import { divideOrZeroIfNaN, numberWithCommas, roundToDecimal } from "../utils";
import NumericalColumn from "./NumericalColumn";
import Tally from "./Tally";

export class PopulationSubgroup extends NumericalColumn {
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

export default class Population {
    constructor(populationRecord, parts) {
        this.total = new PopulationSubgroup({
            ...populationRecord.total,
            parts
        });

        this.subgroups = populationRecord.subgroups.map(
            subgroup =>
                new PopulationSubgroup({
                    ...subgroup,
                    parts,
                    total: this.total
                })
        );
        this.ideal = this.total.sum / parts.length;
        this.formattedIdeal = numberWithCommas(roundToDecimal(this.ideal, 2));

        this.update = this.update.bind(this);
        this.deviations = this.deviations.bind(this);
        this.maxDisplayValue = this.maxDisplayValue.bind(this);
    }
    update(feature, color) {
        this.subgroups.forEach(subgroup =>
            subgroup.tally.update(feature, color)
        );
        this.total.tally.update(feature, color);
    }
    deviations() {
        return this.total.tally.data.map(
            d => Math.abs(d - this.ideal) / this.ideal
        );
    }
    maxDisplayValue() {
        return Math.max(this.ideal * 2, ...this.total.tally.data);
    }
    indicesOfMajorSubgroups() {
        return this.subgroups
            .map((subgroup, i) => i)
            .filter(
                i =>
                    !this.subgroups[i].name.toLowerCase().includes("voting") &&
                    this.subgroups[i].sum > this.total.sum * 0.05
            )
            .sort((i, j) => this.subgroups[j].sum - this.subgroups[i].sum)
            .slice(0, 3);
    }
}
