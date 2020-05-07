import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Parameter from "../Parameter";
import Select from "../Select";
import DemographicsTable from "./DemographicsTable";
import Histogram from "./Histogram";

export default function IncomeHistogramTable(
    chartId,
    population,
    parts,
    chartState,
    dispatch
) {
    return html`
        <section class="toolbar-section">
            ${Histogram(population.subgroups, parts, false)}
        </section>
    `;
}
