import BrushTool from "../components/Toolbar/BrushTool";
import EraserTool from "../components/Toolbar/EraserTool";
import InspectTool from "../components/Toolbar/InspectTool";
import PanTool from "../components/Toolbar/PanTool";
import Brush from "../Map/Brush";
import { renderAboutModal } from "../components/Modal";
import { navigateTo } from "../routes";
import { download } from "../utils";
import { client } from "../api/client";

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
    toolbar.setMenuItems(getMenuItems(editor.state));
}

function exportPlanAsJSON(state) {
    const serialized = state.serialize();
    const text = JSON.stringify(serialized);
    download(`districtr-plan-${serialized.id}.json`, text);
}

function savePlan(state) {
    const serialized = state.serialize();
    return client
        .post("/plans/", serialized)
        .then(resp =>
            resp.ok
                ? console.log("OK!")
                : console.error("Not ok....", resp.json())
        );
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
            name: "Save plan",
            onClick: () => savePlan(state)
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
    return items;
}
