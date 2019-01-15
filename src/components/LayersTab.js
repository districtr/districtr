import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import { createPartisanColorRules } from "../Layers/color-rules";
import DemographicOverlayContainer from "../Layers/DemographicOverlayContainer";
import PartisanOverlayContainer from "../Layers/PartisanOverlayContainer";

export default class LayersTab {
    constructor(id, name, state) {
        this.id = id;
        this.name = name;
        this.partPlural = state.partPlural;

        this.toggleDistricts = () =>
            toggle(`Show ${state.partPlural.toLowerCase()}`, true, checked => {
                if (checked) {
                    state.units.setOpacity(0.8);
                } else {
                    state.units.setOpacity(0);
                }
            });

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
                <div class="layer-list__item">
                    ${
                        this.partisanOverlays
                            ? this.partisanOverlays.render()
                            : ""
                    }
                </div>
            </section>
        `;
    }
}
