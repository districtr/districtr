import { divideOrZeroIfNaN, zeros } from "../utils";
import NumericalColumn from "./NumericalColumn";

import spanish from "../l10n/es";
const i18n = spanish.spanish;

const ABBREVIATIONS = i18n.race.abbreviations;

export class Subgroup extends NumericalColumn {
    constructor({ columnSet, parts, ...args }) {
        super(args);
        this.columnSet = columnSet;
        this.data = zeros(parts.length);

        this.update = this.update.bind(this);
        this.fractionAsMapboxExpression = this.fractionAsMapboxExpression.bind(
            this
        );
        this.getFractionFromFeature = this.getFractionFromFeature.bind(this);
        this.getFractionInPart = this.getFractionInPart.bind(this);
        this.getOverallFraction = this.getOverallFraction.bind(this);
    }
    get total() {
        return this.columnSet.total;
    }
    getFractionFromFeature(feature) {
        return this.getValue(feature) / this.total.getValue(feature);
    }
    getFractionInPart(partIndex) {
        const total = this.total.data[partIndex];
        return total > 0 ? this.data[partIndex] / total : 0;
    }
    getOverallFraction() {
        const total = this.total.sum;
        return total > 0 ? this.sum / total : 0;
    }
    fractionAsMapboxExpression() {
        return divideOrZeroIfNaN(
            this.asMapboxExpression(),
            this.total.asMapboxExpression()
        );
    }
    update(feature, color) {
        if (color !== undefined && color !== null) {
            this.data[color] += this.getValue(feature);
        }
        if (
            feature.state !== undefined &&
            feature.state.color !== undefined &&
            feature.state.color !== null
        ) {
            this.data[feature.state.color] -= this.getValue(feature);
        }
    }
    getAbbreviation() {
        if (ABBREVIATIONS.hasOwnProperty(this.key)) {
            return ABBREVIATIONS[this.key];
        } else {
            return this.name.split(" ")[0];
        }
    }
}
