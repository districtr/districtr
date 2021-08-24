import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import OverlayContainer from "../layers/OverlayContainer";
import PartisanOverlayContainer from "../layers/PartisanOverlayContainer";
import AgeHistogramTable from "../components/Charts/AgeHistogramTable";
import IncomeHistogramTable from "../components/Charts/IncomeHistogramTable";
import DemographicsTable from "../components/Charts/DemographicsTable";

import LayerTab from "../components/LayerTab";
import { addAmerIndianLayer } from "../layers/amin_control";
// import { addBoundaryLayers } from "../layers/current_districts";
import { addCountyLayer } from "../layers/counties";
import { addPOILayers } from "../layers/colleges_hospitals";

import { spatial_abilities } from "../utils";

export default function MultiLayersPlugin(editor) {
    const { state, toolbar } = editor;
    const tab = new LayerTab("layers", "All Layers", editor.store);

    tab.addSection(() => html`<h3 style="margin-bottom:0">Boundaries</h3>`);

    tab.addSection(
        () => html`
            ${toggle("Show Communities", true, checked => {
                let opacity = checked ? 0.8 : 0;
                state.units.setOpacity(opacity);
            })}`
    );

    if (state.place.state === state.place.name) {
        addCountyLayer(tab, state);
    }
    if (spatial_abilities(state.place.id).native_american) {
        addAmerIndianLayer(tab, state);
    }

    // addBoundaryLayers(tab, state, state.place.id.current_districts, state.place.id.school_districts);

    let emitters, coal;
    addPOILayers(tab, state);

    if (state.elections.length > 0) {
        const partisanOverlays = new PartisanOverlayContainer(
            "partisan",
            state.layers.filter(lyr => lyr.id === "extra-precincts"),
            state.elections,
            toolbar
        );
        let registerOverlays = null;
        if (state.voters) {
            registerOverlays = new OverlayContainer(
                "registered_voters",
                state.layers.filter(lyr => lyr.id === "extra-precincts_new"),
                state.voters,
                "Registered Voters",
                false,
                // toolbar
            );
        }
        tab.addSection(
            () => html`
                <h3 style="margin-bottom:0">
                  Voting Records
                  <small>- by VTD</small>
                </h3>
                <div class="section_coi2">
                    <div class="option-list__item">
                        ${partisanOverlays.render()}
                    </div>
                    <hr/>
                    <div class="option-list__item">
                        ${registerOverlays ? registerOverlays.render() : null}
                    </div>
                </div>
            `
        );
    }

    const demographicsOverlay = new OverlayContainer(
        "demographics",
        state.layers.filter(lyr => lyr.id.includes("blockgroups") || lyr.type === "circle"),
        state.population,
        "Map population by race"
    );
    tab.addSection(
        () => html`
        <h3 style="margin-bottom:0">
          Demographics (2018 ACS)
          <small>by blockgroup</small>
        </h3>
        <div class="section_coi2">
            <h4>Race</h4>
            ${demographicsOverlay.render()}
        </div>`
    );

    if (state.vap) {
        const vapOverlays = new OverlayContainer(
            "vap",
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

    if (state.incomes) {
        const incomeOverlay = state.median_income ? new OverlayContainer(
            "income",
            state.layers.filter(lyr => lyr.id.includes("blockgroups")),
            state.median_income,
            "Map median income",
            true // first layer only
        ) : null;
        const snapOverlay = new OverlayContainer(
            "snap",
            state.layers.filter(lyr => lyr.id.includes("tract")),
            state.snap,
            "SNAP Households (2015)",
            true // first layer only
        );

        tab.addSection(
            (uiState, dispatch) =>  html`<h4>Household Income and SNAP</h4>
            <div class="section_coi2">
                ${incomeOverlay ? incomeOverlay.render() : ""}
                <div class="centered">
                  <strong>Histogram</strong>
                </div>
                ${IncomeHistogramTable(
                    "Income Histograms",
                    state.incomes,
                    state.activeParts,
                    uiState.charts["Income Histograms"],
                    dispatch,
                    1.5
                )}
                ${snapOverlay.render()}
            </div>`
        );
    }

    if (state.education) {
        // const eduOverlay = new OverlayContainer(
        //     "education",
        //     state.layers.filter(lyr => lyr.id.includes("blockgroups") || lyr.type === "circle"),
        //     state.education,
        //     "Map Education Level",
        //     true
        // );
        // ${eduOverlay.render()}
        tab.addSection(
            (uiState, dispatch) => html`<h4>Education</h4>
            <div class="section_coi2">
                ${DemographicsTable(
                    state.education.subgroups,
                    state.activeParts
                )}
            </div>`
        );
    }

    if (state.rent) {
        tab.addSection(
            (uiState, dispatch) => html`<h4>Homeowner or Renter</h4>
            <div class="section_coi2">
                ${DemographicsTable(
                    state.rent.subgroups,
                    state.activeParts
                )}
            </div>`
        );
    }

    if (state.broadband) {
        tab.addSection(
            (uiState, dispatch) => html`<h4>Broadband</h4>
            <div class="section_coi2">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>With Computers</th>
                      <th>With Broadband</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.activeParts.map(part => html`<tr>
                        <td>
                          ${part.renderLabel()}
                        </td>
                        <td class="ui-data">
                          ${((Math.round(1000 * state.broadband.subgroups[0].data[part.id] / state.population.subgroups[0].total.data[part.id]) / 10) || 0).toFixed(1)}%
                        </td>
                        <td class="ui-data">
                          ${((Math.round(1000 * state.broadband.subgroups[1].data[part.id] / state.population.subgroups[0].total.data[part.id]) / 10) || 0).toFixed(1)}%
                        </td>
                      </tr>`
                    )}
                  </tbody>
                </table>
            </div>`
        );
    }

    if (state.asthma) {
        const asthmaOverlay = new OverlayContainer(
            "asthma",
            state.layers.filter(lyr => lyr.id.includes("tract")),
            state.asthma,
            "Asthma (only select cities)",
            true
        );
        tab.addSection(() => html`<h4>
          Health
          <small>by tract</small>
        </h4>
        <div class="section_coi2">
            ${asthmaOverlay.render()}
        </div>`)
    }

    toolbar.addTab(tab);
}
