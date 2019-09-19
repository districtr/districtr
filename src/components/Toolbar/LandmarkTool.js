import { html } from "lit-html";
import { toggle } from "../Toggle";
import { Landmarks } from "../Landmark";
import Tool from "./Tool";

export default class LandmarkTool extends Tool {
    constructor(state) {
        const icon = html`<i class="material-icons">label</i>`;
        super("landmark", "Landmark", icon);

        let lm = state.place.landmarks;
        if (!lm.source && !lm.type) {
            // we cannot replace the object, which is used to remember landmarks
            lm.type = "geojson";
            lm.data = {"type": "FeatureCollection", "features": []};
        }
        this.landmarks = new Landmarks(state.map, state.place.landmarks);
        this.options = new LandmarkOptions(this.landmarks);
    }
    activate() {
        super.activate();
        this.landmarks.handleDrawToggle(true);
    }
    deactivate() {
        super.deactivate();
        this.landmarks.handleDrawToggle(false);
    }
}

class LandmarkOptions {
    constructor(landmarks) {
        this.landmarks = landmarks;
    }

    render() {
        return html`
    <div class="ui-option">
        <legend class="ui-label ui-label--row">Landmarks</legend>
        ${toggle(
            `Show landmarks`,
            this.landmarks.visible,
            this.landmarks.handleToggle
        )}
    </div>
        `;
    }
}
