import BrushTool from "../components/Toolbar/BrushTool";
import EraserTool from "../components/Toolbar/EraserTool";
import InspectTool from "../components/Toolbar/InspectTool";
import PanTool from "../components/Toolbar/PanTool";
import LandmarkTool from "../components/Toolbar/LandmarkTool";
import Brush from "../map/Brush";
import NumberMarkers from "../map/NumberMarkers";
import { renderAboutModal, renderSaveModal } from "../components/Modal";
import { navigateTo, savePlanToStorage, savePlanToDB } from "../routes";
import { download } from "../utils";

export default function ToolsPlugin(editor) {
    const { state, toolbar } = editor;
    const brush = new Brush(state.units, 20, 0);
    brush.on("colorfeature", state.update);
    brush.on("colorend", state.render);
    brush.on("colorend", toolbar.unsave);

    let planNumbers = NumberMarkers(state, brush);
    brush.on("colorop", (isUndoRedo, colorsAffected) => {
        savePlanToStorage(state.serialize());
        if (planNumbers) {
            planNumbers.update(state, colorsAffected);
        }
    });

    if (["alaska", "colorado", "ma", "georgia", "hawaii", "maryland", "michigan", "minnesota", "nc", "new_mexico", "ohio", "oklahoma", "oregon", "pennsylvania", "rhode_island", "texas", "utah", "virginia", "vermont", "wisconsin"].includes(state.place.id)) {
        let lastEditedPart = null;
        brush.on("colorfeature", (feature, color, countyBrush) => {
            if (feature && feature.id && !countyBrush) {
                lastEditedPart = feature.properties[state.idColumn.key];
            }
        });
        brush.on("colorop", () => {
            if (!lastEditedPart) {
                return;
            }
            let myEditedPart = "" + lastEditedPart,
                myBrush = (brush.color === null) ? null : (1 * brush.color),
                place = state.place.id,
                extra_source = (state.units.sourceId === "ma_precincts_02_10") ? "ma_02" : 0,
                placeID = extra_source || place,
                part = encodeURIComponent(myEditedPart),
                q = (placeID === "ma") ? "id" : "ids";

            lastEditedPart = null;

            fetch(`https://mggg-states.subzero.cloud/rest/rpc/county_${placeID}?${q}=${part}`).then(res => res.json()).then(units => {
                let names = units.map(feature => (feature[`county_${placeID}`] || feature[state.idColumn.key.toLowerCase()]));
                state.units.setCountyState(names, myBrush, brush.listeners, state.plan.assignment, state.idColumn.key);
                savePlanToStorage(state.serialize());
            });
        });
    }

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
