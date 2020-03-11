import BrushTool from "../components/Toolbar/BrushTool";
import EraserTool from "../components/Toolbar/EraserTool";
import InspectTool from "../components/Toolbar/InspectTool";
import PanTool from "../components/Toolbar/PanTool";
import LandmarkTool from "../components/Toolbar/LandmarkTool";
import Brush from "../map/Brush";
import NumberMarkers from "../map/NumberMarkers";
import ContiguityChecker from "../map/contiguity";
import { renderAboutModal, renderSaveModal } from "../components/Modal";
import { navigateTo, savePlanToStorage, savePlanToDB } from "../routes";
import { download } from "../utils";
import Layer, { addBelowLabels } from "../map/Layer";
import { getUnitColorProperty, unitBordersPaintProperty } from "../colors";
import { getParts } from "../models/lib/column-sets";

export default function ToolsPlugin(editor) {
    const { state, toolbar } = editor;

    const COUNTIES_TILESET = {
        sourceLayer: "cb_2018_us_county_500k-6p4p3f",
        source: { type: "vector", url: "mapbox://districtr.6fcd9f0h" }
    };

    const COUNTIES_LAYER = {
        id: "counties",
        source: COUNTIES_TILESET.sourceLayer,
        "source-layer": COUNTIES_TILESET.sourceLayer,
        type: "fill"
    };
    const stateNameToFips = {
        alabama: "01",
        alaska: "02",
        arizona: "04",
        arkansas: "05",
        california: "06",
        colorado: "08",
        connecticut: "09",
        delaware: 10,
        "district of columbia": 11,
        district_of_columbia: 11,
        florida: 12,
        georgia: 13,
        hawaii: 15,
        idaho: 16,
        illinois: 17,
        indiana: 18,
        iowa: 19,
        kansas: 20,
        kentucky: 21,
        louisiana: 22,
        maine: 23,
        maryland: 24,
        massachusetts: 25,
        ma: 25,
        michigan: 26,
        minnesota: 27,
        mississippi: 28,
        missouri: 29,
        montana: 30,
        nebraska: 31,
        nevada: 32,
        "new hampshire": 33,
        new_hampshire: 33,
        "new jersey": 34,
        new_jersey: 34,
        "new mexico": 35,
        new_mexico: 35,
        "new york": 36,
        new_york: 36,
        "north carolina": 37,
        north_carolina: 37,
        nc: 37,
        "north dakota": 38,
        north_dakota: 38,
        ohio: 39,
        oklahoma: 40,
        oregon: 41,
        pennsylvania: 42,
        "rhode island": 44,
        rhode_island: 44,
        "south carolina": 45,
        south_carolina: 45,
        "south dakota": 46,
        south_dakota: 46,
        tennessee: 47,
        texas: 48,
        utah: 49,
        vermont: 50,
        virginia: 51,
        washington: 53,
        "west virginia": 54,
        west_virginia: 54,
        wisconsin: 55,
        wyoming: 56,
        "puerto rico": 72,
        puerto_rico: 72
    };

    state.map.addSource(COUNTIES_TILESET.sourceLayer, COUNTIES_TILESET.source);
    const counties = new Layer(
        state.map,
        {
            ...COUNTIES_LAYER,
            paint: { "fill-color": getUnitColorProperty(getParts(state.problem)), "fill-opacity": 0.8 },
            filter: [
                "==",
                ["get", "STATEFP"],
                String(stateNameToFips[(state.place.state || state.place.id).toLowerCase()])
            ]
        },
        addBelowLabels
    );

    new Layer(
        state.map,
        {
            ...COUNTIES_LAYER,
            id: "county-borders",
            type: "line",
            paint: {
                ...unitBordersPaintProperty,
                "line-opacity": 0.75,
                "line-width": 2.5
            },
            filter: [
                "==",
                ["get", "STATEFP"],
                String(stateNameToFips[(state.place.state || state.place.id).toLowerCase()])
            ]
        },
        addBelowLabels
    );

    const brush = new Brush(counties, 20, 0);
    brush.on("colorfeature", state.update);
    brush.on("colorend", state.render);
    brush.on("colorend", toolbar.unsave);

    let planNumbers = NumberMarkers(state, brush);
    const c_checker = ContiguityChecker(state, brush);
    brush.on("colorop", (isUndoRedo, colorsAffected) => {
        savePlanToStorage(state.serialize());

        c_checker(state, colorsAffected);

        if (planNumbers) {
            planNumbers.update(state, colorsAffected);
        }
    });

    let tools = [
        new PanTool(),
        new BrushTool(brush, state.parts),
        new EraserTool(brush),
        (state.problem.type === "community" && new LandmarkTool(state)),
        new InspectTool(
            state.units,
            state.columnSets,
            state.nameColumn,
            state.unitsRecord,
            state.parts
        )
    ];

    for (let tool of tools) {
        if (tool) {
            toolbar.addTool(tool);
        }
    }
    toolbar.selectTool("pan");
    toolbar.setMenuItems(getMenuItems(editor.state));
    toolbar.setState(state);

    // show about modal on startup by default
    // exceptions if you last were on this map, or set 'dev' in URL
    try {
        if (
            (window.location.href.indexOf("dev") === -1)
            && (
                !localStorage || (localStorage.getItem("lastVisit") !== state.place.id)
            )
        ) {
            renderAboutModal(editor.state);
            localStorage.setItem("lastVisit", state.place.id);
        }
    } catch(e) {
        // likely no About page exists - silently fail to console
        console.error(e);
    }
}

function exportPlanAsJSON(state) {
    const serialized = state.serialize();
    const text = JSON.stringify(serialized);
    download(`districtr-plan-${serialized.id}.json`, text);
}

function exportPlanAsAssignmentFile(state, delimiter = ",", extension = "csv") {
    let text = `"id-${state.place.id}-${state.units.id}-${state.problem.numberOfParts}`;
    text += `-${state.problem.pluralNoun.replace(/\s+/g, "")}"`;
    text += `${delimiter}assignment\n`;
    text += Object.keys(state.plan.assignment)
        .map(unitId => `${unitId}${delimiter}${state.plan.assignment[unitId]}`)
        .join("\n");
    download(`assignment-${state.plan.id}.${extension}`, text);
}

function getMenuItems(state) {
    let items = [
        {
            name: "About this module",
            onClick: () => renderAboutModal(state, true)
        },
        {
            name: "Districtr homepage",
            onClick: () => {
                if (window.confirm("Would you like to return to the Districtr homepage?")) {
                    window.location.href = "/";
                }
            }
        },
        {
            name: "New plan",
            onClick: () => navigateTo("/new")
        },
        {
            name: "Export this plan",
            onClick: () => exportPlanAsJSON(state)
        },
        {
            name: "Export as assignment CSV",
            onClick: () => exportPlanAsAssignmentFile(state)
        },
        {
            id: "mobile-upload",
            name: "Share plan",
            onClick: () => renderSaveModal(state, savePlanToDB)
        }
    ];
    return items;
}
