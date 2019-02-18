export default class IdColumn {
    constructor({ key, name }) {
        this.key = key;
        this.name = name;
    }
    getValue(feature) {
        if (feature.properties === undefined) {
            return undefined;
        }
        return feature.properties[this.key];
    }
}
