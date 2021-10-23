import { addLayers } from "../map";
import IdColumn from "./IdColumn";
import { assignUnitsAsTheyLoad } from "./lib/assign";
import { generateId } from "../utils";
import { getColumnSets, getParts } from "./lib/column-sets";
import { addBelowLabels, addBelowSymbols } from "../map/Layer";

// We should break this up. Maybe like this:
// [ ] MapState (map, layers)
// [ ] DistrictData (column sets) ?
// [x] DistrictingPlan (assignment, problem, export()) ?
// [ ] Units (unitsRecord, reference to layer?) ? <--- really need this one
// "place" is mostly split up into these categories now.

class DistrictingPlan {
    constructor({ id, state, problem, place, idColumn, parts }) {
        if (id) {
            this.id = id;
        } else {
            this.id = generateId(8);
        }

        this.problem = problem;
        this.assignment = {};
        if (!place.landmarks) {
            place.landmarks = {};
        }
        this.place = { id: place.id, landmarks: place.landmarks, state: place.state, name: place.name };
        this.parts = getParts(problem);
        if (parts) {
            for (let i = 0; i < parts.length; i++) {
                this.parts.find(p => p.displayNumber === parts[i].displayNumber).updateDescription(parts[i]);
            }
        }
        if (problem.type === "multimember" || problem.type === "community") {
            this.parts.slice(1).forEach(part => {
                part.visible = false;
            });
        }
        if (problem.type === "community") {
            this.parts.forEach(part => {
                if (!part.name) {
                    part.name = `Community ${part.displayNumber}`;
                }
            });
        }
        this.idColumn = idColumn;
    }
    update(feature, part) {
        let featureId = this.idColumn.getValue(feature);
        if (!part && (part !== 0)) {
            // erasing this part
            delete this.assignment[featureId];
        } else {
            // districting (only one assignment possible at a time)
            this.assignment[featureId] = part;
        }
    }
    serialize() {
        return {
            name: this.name,
            description: this.description,
            assignment: this.assignment,
            id: this.id,
            idColumn: { key: this.idColumn.key, name: this.idColumn.name },
            problem: this.problem,
            parts: this.parts.filter(p => p.visible).map(p => p.serialize()),
            place: { id: this.place.id, landmarks: this.place.landmarks, state: this.place.state, name: this.place.name }
        };
    }
}

/**
 * Holds all of the state that needs to be updated after
 * each brush stroke. (Mainly the Plan assignment and the
 * population tally.)
 */
export default class State {
    constructor(
        map,
        swipemap,
        { place, problem, id, assignment, units, ...args },
        readyCallback
    ) {
        this.unitsRecord = units;
        this.place = place;
        this.idColumn = new IdColumn(units.idColumn);
        if (units.hasOwnProperty("nameColumn")) {
            this.nameColumn = new IdColumn(units.nameColumn);
        }
        this.plan = new DistrictingPlan({
            id,
            assignment,
            problem,
            place,
            ...args,
            idColumn: this.idColumn
        });

        this.initializeMapState(
            map,
            swipemap,
            units,
            problem.type === "community" ? addBelowLabels : addBelowSymbols,
            place.id,
            place.state
        );
        
        this.columnSets = getColumnSets(this, units);

        this.subscribers = [];

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);

        if (assignment) {
            assignUnitsAsTheyLoad(this, assignment, readyCallback);
        } else {
            readyCallback();
        }
    }
    get activeParts() {
        return this.plan.parts.filter(part => part.visible);
    }
    initializeMapState(map, swipemap, unitsRecord, layerAdder, borderId, statename) {
        const {
            units, unitsBorders,
            coiunits, coiunits2,
            bg_areas, bg_points,
            swipeUnits, swipeUnitsBorders,
            points, swipePoints,
             counties, precincts, new_precincts, tracts,
            clusterUnits, clusterUnitsLines
        } = addLayers(map,
            swipemap,
            this.parts,
            unitsRecord.tilesets,
            layerAdder,
            borderId,
            statename
        );

        this.units = units;
        this.unitsBorders = unitsBorders;
        this.coiunits = coiunits;
        this.clusterUnits = clusterUnits;
        this.clusterUnitsLines = clusterUnitsLines;
        this.coiunits2 = coiunits2;
        this.swipeUnits = swipeUnits;
        // this.swipeUnitsBorders = swipeUnitsBorders;
        this.counties = counties;
        this.layers = [units, points, bg_areas, precincts, new_precincts, tracts].filter(x => !!x);
        this.swipeLayers = [];
        this.map = map;
    }
    update(feature, part) {
        this.columnSets.forEach(columnSet => columnSet.update(feature, part, this.divisor));
        this.plan.update(feature, part);
    }
    get parts() {
        return this.plan.parts;
    }
    get problem() {
        return this.plan.problem;
    }
    serialize() {
        return {
            ...this.plan.serialize(),
            placeId: this.place.id,
            units: this.unitsRecord
        };
    }
    subscribe(f) {
        this.subscribers.push(f);
        this.render();
    }
    render() {
        for (let f of this.subscribers) {
            f();
        }
    }
    hasExpectedData(feature) {
        if (feature === undefined || feature.properties === undefined) {
            return false;
        }
        if (feature.properties[this.idColumn.key] === undefined) {
            return false;
        }
        for (let column of this.columns) {
            if (feature.properties[column.key] === undefined) {
                return false;
            }
        }
        return true;
    }
}
