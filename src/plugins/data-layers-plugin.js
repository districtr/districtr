import { Landmarks } from "../components/Landmark";
import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import OverlayContainer from "../Layers/OverlayContainer";
import PartisanOverlayContainer from "../Layers/PartisanOverlayContainer";
import LayerTab from "../components/LayerTab";

export default function DataLayersPlugin(editor) {
    const { state, toolbar } = editor;
    const landmarks = state.place.landmarks
        ? new Landmarks(state.map, state.place.landmarks)
        : null;

    if (landmarks && Object.keys(state.plan.assignment).length > 0) {
        landmarks.handleToggle(false);
    }

    const tab = new LayerTab("layers", "Data Layers", editor.store);

    const districtsHeading =
        state.plan.problem.type === "community" ? "Communities" : "Districts";
    const districtMessage =
        state.plan.problem.type === "community"
            ? "Show communities"
            : "Show districts";
    tab.addSection(
        () => html`
            <h4>${districtsHeading}</h4>
            ${toggle(districtMessage, true, checked => {
                if (checked) {
                    state.units.setOpacity(0.8);
                } else {
                    state.units.setOpacity(0);
                }
            })}
        `
    );

    if (landmarks) {
        tab.addSection(
            () => html`
                <h4>Landmarks</h4>
                ${toggle(
                    `Show landmarks`,
                    landmarks.visible,
                    landmarks.handleToggle
                )}
            `
        );
    }

    // Right now we're doing all of these if statements,
    // but in the future we should just be able to register
    // layer types for different columnSet types and have
    // that determine what is rendered.

    const demographicsOverlay = new OverlayContainer(
        state.layers,
        state.population,
        "Show demographics"
    );

    tab.addSection(
        () => html`
            <h4>Demographics</h4>
            ${demographicsOverlay.render()}
        `
    );

    if (state.vap) {
        const vapOverlays = new OverlayContainer(
            state.layers,
            state.vap,
            "Show VAP demographics"
        );
        tab.addSection(
            () =>
                html`
                    <h4>Voting Age Population</h4>
                    ${vapOverlays.render()}
                `
        );
    }

    if (state.elections.length > 0) {
        const partisanOverlays = new PartisanOverlayContainer(
            state.layers,
            state.elections
        );
        tab.addSection(
            () => html`
                <div class="option-list__item">
                    ${partisanOverlays.render()}
                </div>
            `
        );
    }

    toolbar.addTab(tab);
}
