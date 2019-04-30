import { html } from "lit-html";
import { numberWithCommas } from "../../utils";

export function TooltipBar(percent) {
    return html`
        <div
            class="tooltip-data__row__bar"
            style=${`width: ${Math.round(percent * 100)}%`}
        ></div>
    `;
}

function formatColumnName(name, maxVariableLength) {
    if (name.length > maxVariableLength) {
        return name.slice(0, maxVariableLength - 3) + "...";
    } else {
        return name;
    }
}

/**
 * This displays the labeled bar chart in the tooltip.
 * Hopefully we can eventually abstract this out so that it works
 * in more contexts, but right now the layout depends on absolute
 * postitioning which won't be workable elsewhere.
 * @param {ColumnSet} columnSet
 * @param {number[]} values
 * @param {number[]} total
 * @param {number} [maxVariableLength=27]
 */
export function HorizontalBarChart(
    columnSet,
    values,
    total,
    maxVariableLength = 27
) {
    return html`
        <dl class="tooltip-data">
            ${columnSet.columns.map((column, i) => {
                const value = values[i];
                return html`
                    <div class="tooltip-data__row">
                        <dt>
                            ${formatColumnName(column.name, maxVariableLength)}
                        </dt>
                        <dd>
                            ${numberWithCommas(Math.round(value))}
                        </dd>
                        ${column.total !== undefined
                            ? TooltipBar(value / total)
                            : ""}
                    </div>
                `;
            })}
        </dl>
    `;
}
