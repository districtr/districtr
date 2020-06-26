import { html } from "lit-html";
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
