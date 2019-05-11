import { html } from "lit-html";
import { sum, zeros } from "../../utils";
import { HorizontalBarChart } from "./HorizontalBarChart";

function tooltipDots(features, parts) {
    let partCounts = zeros(parts.length);
    for (let feature of features) {
        if (feature.state.color !== null && feature.state.color !== undefined) {
            partCounts[feature.state.color] += 1;
        }
    }
    if (sum(partCounts) === 0) {
        return "";
    }
    const nonzeroParts = parts.filter((part, i) => partCounts[i] > 0);
    return html`
        <div class="tooltip__dots">
            ${nonzeroParts.slice(0, 6).map(
                part =>
                    html`
                        <span
                            class="part-number tooltip__dot"
                            style="background-color: ${part.color}"
                            >${parts.length > 10
                                ? part.displayNumber
                                : ""}</span
                        >
                    `
            )}
            ${nonzeroParts.length > 6
                ? html`
                      &hellip;
                  `
                : ""}
        </div>
    `;
}

function tooltipHeading(features, nameColumn, pluralNoun, parts) {
    let title = `${features.length} ${
        features.length == 1 ? pluralNoun.slice(0, -1) : pluralNoun
    }`;
    if (
        nameColumn !== undefined &&
        nameColumn !== null &&
        features.length === 1
    ) {
        title = nameColumn.getValue(features[0]);
    }
    return html`
        <div class="tooltip__text">
            <h4 class="tooltip__title">
                ${title}
            </h4>
            ${tooltipDots(features, parts)}
        </div>
    `;
}

/**
 * Render the content of the tooltip element that follows the mouse around.
 * @param {GeoJSON.Feature[]} features
 * @param {NumericalColumn[]} columns
 */
export function TooltipContent(
    features,
    columnSet,
    nameColumn,
    pluralNoun,
    parts
) {
    if (features === null || features === undefined) {
        return "";
    }
    const total = sum(features.map(f => columnSet.total.getValue(f)));
    const values = columnSet.columns.map(column =>
        sum(features.map(f => column.getValue(f)))
    );
    return html`
        ${tooltipHeading(features, nameColumn, pluralNoun, parts)}
        ${HorizontalBarChart(columnSet, values, total)}
    `;
}
