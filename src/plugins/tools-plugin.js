import netlifyIdentity from "netlify-identity-widget";
import BrushTool from "../components/Toolbar/BrushTool";
import EraserTool from "../components/Toolbar/EraserTool";
import InspectTool from "../components/Toolbar/InspectTool";
import PanTool from "../components/Toolbar/PanTool";
import LandmarkTool from "../components/Toolbar/LandmarkTool";
import Brush from "../map/Brush";
import { renderAboutModal } from "../components/Modal";
import { navigateTo, savePlanToStorage } from "../routes";
import { download } from "../utils";

export default function ToolsPlugin(editor) {
    const { state, toolbar } = editor;
    const brush = new Brush(state.units, 20, 0);
    brush.on("colorfeature", state.update);
    brush.on("colorend", state.render);
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
    try {
        netlifyIdentity.on("init", () => {
            getMenuItems(editor.state, toolbar);
        });
        netlifyIdentity.init();
    } catch (e) {
        getMenuItems(editor.state, toolbar);
    }

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

function getMenuItems(state, toolbar) {
    let items = [
        {
            name: "About this module",
            onClick: () => renderAboutModal(state, true)
        },
        {
            name: "MGGG homepage",
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
        }
    ];

    const user = netlifyIdentity.currentUser();
    netlifyIdentity.on("login", () => {
        getMenuItems(state, toolbar);
    });
    netlifyIdentity.on("logout", () => {
        getMenuItems(state, toolbar);
    });
    if (user) {
        items = items.concat([
            {
                name: "Upload to event page",
                onClick: () => {

                }
            },
            {
                name: "Sign out",
                onClick: () => {
                    netlifyIdentity.logout();
                }
            }
        ]);
    } else {
        items.push({
            name: "Sign in to upload plans",
            onClick: () => { netlifyIdentity.open() }
        });
    }
    toolbar.setMenuItems(items);
}
