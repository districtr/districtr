import { numberWithCommas, sum, zeros } from "../utils";

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
        return parseFloat(feature.properties[this.key] || 0);
    }
    formatValue(feature) {
        return numberWithCommas(this.getValue(feature));
    }
    asMapboxExpression() {
        return ["to-number", ["get", this.key]];
    }
}

export class SumOfColumns {
    constructor({ columns, columnSet, parts }) {
        this.columns = columns;
        this.columnSet = columnSet;

        this.data = zeros(parts.length);

        this.sum = sum(this.columns.map(col => col.sum));
        this.min = Math.min(...this.columns.map(col => col.min));
        this.max = Math.max(...this.columns.map(col => col.max));

        this.getValue = this.getValue.bind(this);
        this.formatValue = this.formatValue.bind(this);
        this.asMapboxExpression = this.asMapboxExpression.bind(this);
        this.update = this.update.bind(this);
    }
    get total() {
        return this.columnSet.total;
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
    getValue(feature) {
        return sum(this.columns.map(col => col.getValue(feature)));
    }
    formatValue(feature) {
        return numberWithCommas(this.getValue(feature));
    }
    asMapboxExpression() {
        let total = ["+"];
        this.columns.forEach(col => {
            total.push(col.asMapboxExpression());
        });
        return total;
    }
}
