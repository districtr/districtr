import BrushTool from "../components/Toolbar/BrushTool";
import EraserTool from "../components/Toolbar/EraserTool";
import InspectTool from "../components/Toolbar/InspectTool";
import PanTool from "../components/Toolbar/PanTool";
import Brush from "../Map/Brush";
import {
    renderAboutModal,
    renderSaveModal,
    renderRenameModal,
    renderSaveAsModal,
    renderDeleteModal
} from "../components/Modal";
import { navigateTo } from "../routes";
import { download } from "../utils";
import { savePlan } from "../api/plans";
import { client } from "../api/client";
import initializeAuthContext, {
    getCurrentUser,
    unauthenticatedUser
} from "../api/auth";

export default function ToolsPlugin(editor) {
    const { state, toolbar } = editor;
    const brush = new Brush(state.units, 20, 0);
    brush.on("colorfeature", state.update);
    brush.on("colorend", state.render);

    let tools = [
        new PanTool(),
        new BrushTool(brush, state.parts),
        new EraserTool(brush),
        new InspectTool(
            state.units,
            state.columnSets,
            state.nameColumn,
            state.unitsRecord,
            state.parts
        )
    ];

    for (let tool of tools) {
        toolbar.addTool(tool);
    }
    toolbar.selectTool("pan");
    getMenuItems(editor.state).then(items => toolbar.setMenuItems(items));
}

function exportPlanAsJSON(state) {
    const serialized = state.serialize();
    const text = JSON.stringify(serialized);
    download(`districtr-plan-${serialized.id}.json`, text);
}

function savePlanMenuAction(state) {
    if (state.plan.neverSaved) {
        renderSaveModal(state, () => savePlan(state));
    } else {
        savePlan(state);
    }
}

function exportPlanAsAssignmentFile(plan, delimiter = ",", extension = "csv") {
    const text = Object.keys(plan.assignment)
        .map(unitId => `${unitId}${delimiter}${plan.assignment[unitId]}`)
        .join("\n");
    download(`assignment-${plan.id}.${extension}`, text);
}

function getMenuItems(state) {
    let items = [
        {
            name: "About this module",
            onClick: () => renderAboutModal(state)
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
            onClick: () => exportPlanAsAssignmentFile(state.plan)
        }
    ];

    return initializeAuthContext(client)
        .then(() => getCurrentUser(client))
        .then(user => {
            if (user !== unauthenticatedUser && user.roles.includes("admin")) {
                items = [
                    ...items.slice(0, 2),
                    {
                        name: "Open plan",
                        onClick: () => navigateTo("/dashboard")
                    },
                    {
                        name: "Save plan",
                        onClick: () => savePlanMenuAction(state)
                    },
                    {
                        name: "Save plan as...",
                        onClick: () => renderSaveAsModal(state)
                    },
                    {
                        name: "Rename plan",
                        onClick: () => renderRenameModal(state)
                    },
                    {
                        name: "Delete plan",
                        onClick: () => renderDeleteModal(state)
                    },
                    ...items.slice(2)
                ];
            }
            return items;
        });
}
