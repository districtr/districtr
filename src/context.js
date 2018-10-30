/*
This is a sort of "context local variables" design pattern I'm trying out.
We keep this singleton object that translates from mapbox features to the
information (like a unit's population that we want).

An alternative would be to always wrap features in our class with getters
and setters like getColor and getPopulation. We'd need to configure that
class with the right attribute keys too.

Or we could also give the Layer class methods like getFeatureColor and
getFeaturePopulation, since the Layer class needs to know about all of the
layerInfo data already. We'd still have to pass the layer object around.
*/

class Context {
    constructor(attributeKeys) {
        this.attributeKeys = attributeKeys ? attributeKeys : {};
    }
    registerAttribute(attribute, key) {
        this.attributeKeys[attribute] = key;
    }
}

let context = new Context();

export function getPopulation(feature) {
    return feature.properties[context.attributeKeys.population];
}

export function getCurrentContext() {
    return context;
}
