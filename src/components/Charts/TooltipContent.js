import { html } from "lit-html";
import { sum, zeros } from "../../utils";
import { HorizontalBarChart } from "./HorizontalBarChart";

function tooltipDots(features, parts) {
    let partCounts = zeros(parts.length);
    for (let feature of features) {
        if (feature.state.color !== null && feature.state.color !== undefined) {
            if (Array.isArray(feature.state.color)) {
                feature.state.color.forEach(color => {
                    partCounts[color] += 1;
                });
            } else {
                partCounts[feature.state.color] += 1;
            }
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
    parts,
    columnSetIndex,
    divisor
) {
    if (features === null || features === undefined) {
        return "";
    }
    let total = sum(features.map(f => columnSet.total.getValue(f)));
    if (columnSet.name.toLowerCase() === "percentages") {
        features = features.slice(0, 1);
        total = 1;
    }
    let values = columnSet.columns.map(column =>
        sum(features.map(f => column.getValue(f) || 0))
    );

    if (columnSet.type === "election") {
        let votesum = values.reduce((a, b) => a + b, 0);
        let alternate = columnSet.alternate
            && document.querySelector("input[name='partisanvote']")
            && !document.querySelector("input[name='partisanvote']").checked;
        if (alternate) {
            values = columnSet.alternate.columns.map(column =>
                sum(features.map(f => column.getValue(f)))
            );
        }
        columnSet = {
            columns: (alternate ? columnSet.alternate : columnSet).columns.filter(c => c.name).map((c, i) => {
                c.share = Math.round(100 * values[i] / votesum);
                return c;
            }),
            ...(alternate ? columnSet.alternate : columnSet)
        };
    } else if (columnSet.total_alt) {
        if (columnSetIndex === 0) {
            // 2010 pop
            values = values.filter((f, index) => !columnSet.columns[index].total_alt);
            columnSet = {
                columns: columnSet.columns.filter(c => !c.total_alt),
                ...columnSet,
            };
        } else {
            //  2018/2019 pop
            total = sum(features.map(f => columnSet.total_alt.getValue(f)));
            values = values.filter((f, index) => columnSet.columns[index].total_alt);
            columnSet = {
                columns: columnSet.columns.filter(c => c.total_alt),
                ...columnSet,
            };
        }
    } else if (divisor) {
        values = values.map(v => v / divisor);
    }


    return html`
        ${tooltipHeading(features, nameColumn, pluralNoun, parts)}
        ${HorizontalBarChart(columnSet, values, total)}
    `;
}
