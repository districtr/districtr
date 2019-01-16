export default class IdColumn {
    constructor({ key, name }) {
        this.key = key;
        this.name = name;
    }
    getValue(feature) {
        return feature.properties[this.key];
    }
}
