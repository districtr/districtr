import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import { createPartisanColorRules } from "../Layers/color-rules";
import DemographicOverlayContainer from "../Layers/DemographicOverlayContainer";
import PartisanOverlayContainer from "../Layers/PartisanOverlayContainer";

export default class LayersTab {
    constructor(id, name, state) {
        this.id = id;
        this.name = name;
        this.partPlural = state.problem.pluralNoun;

        this.landmarks = state.landmarks
            ? () => toggle(`Show landmarks`, true, state.landmarks.handleToggle)
            : null;

        this.toggleDistricts = () =>
            toggle(
                `Show ${this.partPlural.toLowerCase()}`,
                true,
                checked => {
                    if (checked) {
                        state.units.setOpacity(0.8);
                    } else {
                        state.units.setOpacity(0);
                    }
                }
            );

        this.partisanOverlays =
            state.elections.length > 0
                ? new PartisanOverlayContainer(
                      state.layers,
                      state.elections,
                      createPartisanColorRules(state)
                  )
                : null;

        this.demographicOverlays = new DemographicOverlayContainer(
            state.layers,
            state.population
        );
    }
    render() {
        return html`
            <section id="layers" class="toolbar-section layer-list">
                <div class="layer-list__item">
                    <h4>${this.partPlural}</h4>
                    ${this.toggleDistricts()}
                </div>
                <div class="layer-list__item">
                    ${this.demographicOverlays.render()}
                </div>

                ${this.partisanOverlays
                    ? html`
                          <div class="layer-list__item">
                              ${this.partisanOverlays.render()}
                          </div>
                      `
                    : ""}
                ${this.landmarks
                    ? html`
                          <div class="layer-list__item">
                              <h4>Landmarks</h4>
                              ${this.landmarks()}
                          </div>
                      `
                    : ""}
            </section>
        `;
    }
}
