import { addLayers } from "../Map/map";
import IdColumn from "./IdColumn";
import { assignUnitsAsTheyLoad } from "./lib";
import { generateId } from "../utils";
import { getColumnSets, getParts } from "./column-sets";
import { addBelowLabels, addBelowSymbols } from "../Layers/Layer";

// We should break this up. Maybe like this:
// [x] MapState (map, layers)
// [ ] DistrictData (column sets) ?
// [x] DistrictingPlan (assignment, problem, export()) ?
// [ ] Units (unitsRecord, reference to layer?,
//     name and id columns) ? <--- really need this one
// "place" is mostly split up into these categories now.
// Only remaining thing is place.name

class DistrictingPlan {
    constructor({ id, problem, idColumn, parts }) {
        if (id) {
            this.id = id;
        } else {
            this.id = generateId(12);
        }

        this.problem = {
            id: problem.id,
            number: problem.number || problem.numberOfParts,
            name: problem.name,
            pluralNoun: problem.plural_noun || problem.pluralNoun,
            type: problem.type || "districts"
        };
        this.assignment = {};
        this.parts = getParts(problem, parts);
        this.idColumn = idColumn;
    }
    update(feature, part) {
        this.assignment[this.idColumn.getValue(feature)] = part;
    }
    serialize() {
        return {
            name: this.id,
            assignment: this.assignment,
            // id: this.id,
            problem_id: this.problem.id,
            parts: this.parts.filter(p => p.visible).map(p => p.serialize())
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
        { place, problem, id, assignment, units, ...args },
        readyCallback
    ) {
        this.unitsRecord = units;
        this.place = place;
        this.idColumn = new IdColumn(units.idColumn);
        if (units.nameColumn) {
            this.nameColumn = new IdColumn(units.nameColumn);
        }
        this.plan = new DistrictingPlan({
            id,
            assignment,
            problem,
            idColumn: this.idColumn,
            ...args
        });

        this.initializeMapState(
            map,
            units,
            problem.type === "community" ? addBelowLabels : addBelowSymbols
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
    initializeMapState(map, unitsRecord, layerAdder) {
        const { units, unitsBorders, points } = addLayers(
            map,
            this.parts,
            unitsRecord.tilesets,
            layerAdder
        );

        this.units = units;
        this.unitsBorders = unitsBorders;
        this.layers = [units, points];
        this.map = map;
    }
    update(feature, part) {
        this.columnSets.forEach(columnSet => columnSet.update(feature, part));
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
            place_id: this.place.id,
            units_id: this.unitsRecord.id
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
        for (let column of this.columns) {
            if (feature.properties[column.key] === undefined) {
                return false;
            }
        }
        return true;
    }
}
