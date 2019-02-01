import { numberWithCommas } from "../utils";

export default class NumericalColumn {
    constructor(columnRecord) {
        this.name = columnRecord.name;
        this.key = columnRecord.key;
        this.sum = columnRecord.sum;
        this.min = columnRecord.min;
        this.max = columnRecord.max;

        this.getValue = this.getValue.bind(this);
        this.formatValue = this.formatValue.bind(this);
        this.asMapboxExpression = this.asMapboxExpression.bind(this);
    }
    getValue(feature) {
        return parseFloat(feature.properties[this.key]);
    }
    formatValue(feature) {
        return numberWithCommas(this.getValue(feature));
    }
    asMapboxExpression() {
        return ["to-number", ["get", this.key]];
    }
}
