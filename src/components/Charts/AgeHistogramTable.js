import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Parameter from "../Parameter";
import Select from "../Select";
import DemographicsTable from "./DemographicsTable";
import Histogram from "./Histogram";

export default function AgeHistogramTable(
    chartId,
    population,
    parts,
    chartState,
    dispatch
) {
    const subgroups = population.subgroups.map((p) => {
        p.name = p.name.replace("Ages ", "").replace("Age ", "").replace("Under ", "<");
        return p;
    });

    return html`
        <section class="toolbar-section">
            ${Histogram(population.subgroups, parts, true)}
        </section>
    `;
}
