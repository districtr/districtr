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
        return this.total
            .values()
            .map(d => Math.abs(d - this.ideal) / this.ideal);
    }
    maxDisplayValue() {
        return Math.max(this.ideal * 2, ...this.total.values());
    }
}
