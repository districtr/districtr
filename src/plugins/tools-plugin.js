import BrushTool from "../components/Toolbar/BrushTool";
import EraserTool from "../components/Toolbar/EraserTool";
import InspectTool from "../components/Toolbar/InspectTool";
import PanTool from "../components/Toolbar/PanTool";
import LandmarkTool from "../components/Toolbar/LandmarkTool";
import Brush from "../map/Brush";
import { renderAboutModal, renderSaveModal } from "../components/Modal";
import { navigateTo, savePlanToStorage, savePlanToDB } from "../routes";
import { download } from "../utils";

import spanish from "../l10n/es";
const i18n = spanish.spanish;

export default function ToolsPlugin(editor) {
    const { state, toolbar } = editor;
    const brush = new Brush(state.units, 20, 0);
    brush.on("colorfeature", state.update);
    brush.on("colorend", state.render);
    brush.on("colorend", toolbar.unsave);
    brush.on("colorend", () => {
        savePlanToStorage(state.serialize());
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
            name: i18n.editor.menu.about,
            onClick: () => renderAboutModal(state, true)
        },
        {
            name: i18n.editor.menu.homepage,
            onClick: () => {
                if (window.confirm(i18n.editor.menu.confirm_homepage)) {
                    window.location.href = "/";
                }
            }
        },
        {
            name: i18n.editor.menu.new,
            onClick: () => navigateTo("/new")
        },
        {
            name: i18n.editor.menu.export,
            onClick: () => exportPlanAsJSON(state)
        },
        {
            name: i18n.editor.menu.export_csv,
            onClick: () => exportPlanAsAssignmentFile(state)
        },
        {
            id: "mobile-upload",
            name: i18n.editor.menu.share,
            onClick: () => renderSaveModal(state, savePlanToDB)
        }
    ];
    return items;
}
