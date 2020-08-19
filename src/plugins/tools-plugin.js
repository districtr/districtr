import hotkeys from 'hotkeys-js';

import BrushTool from "../components/Toolbar/BrushTool";
import EraserTool from "../components/Toolbar/EraserTool";
import InspectTool from "../components/Toolbar/InspectTool";
import PanTool from "../components/Toolbar/PanTool";
import LandmarkTool from "../components/Toolbar/LandmarkTool";
import Brush from "../map/Brush";
import CommunityBrush from "../map/CommunityBrush";
import { HoverWithRadius } from "../map/Hover";
import NumberMarkers from "../map/NumberMarkers";
import ContiguityChecker from "../map/contiguity";
import { renderAboutModal, renderSaveModal } from "../components/Modal";
import { navigateTo, savePlanToStorage, savePlanToDB } from "../routes";
import { download, spatial_abilities /* , stateNameToFips */ } from "../utils";

export default function ToolsPlugin(editor) {
    const { state, toolbar } = editor;
    const brush = new Brush(state.units, 1, 0);
    // brush.on("colorfeature", state.update);
    brush.on("colorfeature", (e) => {
        console.log(state.idColumn.key);
        let uid = e.properties[state.idColumn.key];
        fetch("/.netlify/functions/localPlans?id=" + uid).then(res => res.json()).then((data) => {
            let plans = data.plans;
            window.plans = plans.map((upload) => {
                let assignment = upload.plan.assignment;
                let selectColor = assignment[uid];
                return Object.keys(assignment).filter(key => assignment[key] === selectColor);
            });
            // console.log(plans);
            if (plans.length) {
                window.setPage = (pageIndex) => {
                    if (pageIndex < 0 || pageIndex >= window.plans.length) {
                        return;
                    }
                    window.planIndex = pageIndex;
                    let samplePlan = window.plans[window.planIndex];
                    Object.keys(state.plan.assignment).forEach((painted) => {
                        state.update(painted, samplePlan.includes(painted) ? 0 : null);
                    });
                    samplePlan.forEach(painted => state.update(painted, 0));
                };
                window.setPage(0);
            }
        });
    });
    brush.on("colorend", state.render);
    brush.on("colorend", toolbar.unsave);

    let brushOptions = {
        community: false,
        county_brush: null
    };

    let planNumbers = NumberMarkers(state, brush);
    const c_checker = ContiguityChecker(state, brush);
    brush.on("colorop", (isUndoRedo, colorsAffected) => {
        savePlanToStorage(state.serialize());
        if (spatial_abilities(state.place.id).contiguity) {
            c_checker(state, colorsAffected);
        }

        if (planNumbers) {
            planNumbers.update(state, colorsAffected);
        }
    });

    let tools = [
        new PanTool(),
        new BrushTool(brush, state.parts, brushOptions),
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

    hotkeys.filter = ({ target }) => {
        return (
            !["INPUT", "TEXTAREA"].includes(target.tagName) ||
            (target.tagName === "INPUT" && target.type.toLowerCase() !== "text")
        );
    };
    hotkeys("h", (evt, handler) => {
        evt.preventDefault();
        toolbar.selectTool("pan");
    });
    hotkeys("p", (evt, handler) => {
        evt.preventDefault();
        toolbar.selectTool("brush");
    });
    hotkeys("e", (evt, handler) => {
        evt.preventDefault();
        toolbar.selectTool("eraser");
    });
    hotkeys("i", (evt, handler) => {
        evt.preventDefault();
        toolbar.selectTool("inspect");
    });

    // show about modal on startup by default
    // exceptions if you last were on this map, or set 'dev' in URL
    try {
        if ((window.location.href.indexOf("dev") === -1) &&
            (!localStorage || localStorage.getItem("lastVisit") !== state.place.id)
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
