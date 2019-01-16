export default class NumericalColumn {
    constructor(columnRecord) {
        this.name = columnRecord.name;
        this.key = columnRecord.key;
        this.sum = columnRecord.sum;
        this.min = columnRecord.min;
        this.max = columnRecord.max;

        this.getValue = this.getValue.bind(this);
        this.asMapboxExpression = this.asMapboxExpression.bind(this);
    }
    getValue(feature) {
        return parseFloat(feature.properties[this.key]);
    }
    asMapboxExpression() {
        return ["to-number", ["get", this.key]];
    }
}
