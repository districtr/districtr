import LayersList from "../components/LayerList";
import { Landmarks } from "../components/Landmark";
import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import OverlayContainer from "../Layers/OverlayContainer";
import PartisanOverlayContainer from "../Layers/PartisanOverlayContainer";

export default function DataLayersPlugin(editor) {
    const { state, toolbar } = editor;
    const landmarks = state.place.landmarks
        ? new Landmarks(state.map, state.place.landmarks)
        : null;

    if (landmarks && Object.keys(state.plan.assignment).length === 0) {
        landmarks.handleToggle(false);
    }

    let items = [];

    items.push(
        () => html`
            <h4>Districts</h4>
            ${toggle(`Show districts`, true, checked => {
                if (checked) {
                    state.units.setOpacity(0.8);
                } else {
                    state.units.setOpacity(0);
                }
            })}
        `
    );

    if (landmarks) {
        items.push(
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

    const demographicsOverlay = new OverlayContainer(
        state.layers,
        state.population,
        "Show demographics"
    );

    items.push(
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
        items.push(
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
        items.push(
            () => html`
                <div class="layer-list__item">
                    ${partisanOverlays.render()}
                </div>
            `
        );
    }

    const layersTab = new LayersList("layers", "Data Layers", items);
    toolbar.addTab(layersTab);
}
