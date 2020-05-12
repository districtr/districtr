import { roundToDecimal, numberWithCommas } from "../../utils";
import DataTable from "./DataTable";
import { html } from "lit-html";
import Select from "../Select";
import Parameter from "../Parameter";
import { toggle } from "../Toggle";
import { actions } from "../../reducers/charts";
import { generateId } from "../../utils";
import Layer, { addBelowLabels } from "../../map/Layer";

/**
 * We want the background color to be #f9f9f9 when value = 0, and black when
 * the value = 1. #f9f9f9 is the same as rgba(0, 0, 0, 0.02), so we map the 0-to-1
 * value scale to the 0.02-to-1 alpha scale.
 * @param {number} value - the subgroup's share of the district's population
 *  (between 0 and 1)
 */
function getBackgroundColor(value) {
    return `rgba(0, 0, 0, ${Math.min(
        roundToDecimal(Math.max(value, 0) * 0.98 + 0.02, 2),
        1
    )})`;
}

function getCellStyle(value) {
    const background = getBackgroundColor(value);
    const color = value > 0.4 ? "white" : "black";
    return `background: ${background}; color: ${color}; width: 50%;`;
}

function getCell(value) {
    return {
        content: `${roundToDecimal(value * 100, 1)}%`,
        style: getCellStyle(value)
    };
}

function getEntries(subgroup, part) {
    const districtFraction = subgroup.getFractionInPart(part.id);
    const overallFraction = subgroup.sum / subgroup.total.sum;
    return [getCell(districtFraction), getCell(overallFraction)];
}

export function DistrictEvaluationTable(columnSet, placeName, part) {
    if (!part) {
        part = [{ id: 0 }];
    }
    const subgroups = columnSet.subgroups;
    const headers = [part.name || part.renderLabel(), placeName];
    let rows = [
        {
            label: "Total",
            entries: [
                {
                    content: numberWithCommas(columnSet.total.data[part.id]),
                    style: "width: 40%"
                },
                {
                    content: numberWithCommas(columnSet.total.sum),
                    style: "width: 40%"
                }
            ]
        }
    ];
    rows.push(
        ...subgroups.map(subgroup => ({
            label: subgroup.getAbbreviation(),
            entries: getEntries(subgroup, part)
        }))
    );

    return DataTable(headers, rows);
}

export default DistrictEvaluationTable;

export const CoalitionPivotTable = (chartId, columnSet, placeName, parts, units) => (
    uiState,
    dispatch
) => {
    const visibleParts = parts.filter(part => part.visible);
    let fullsum = 0,
        mockData = [],
        selectSGs = columnSet.subgroups.filter(sg => uiState.charts[chartId][sg.key]);
    selectSGs.forEach(sg => {
        fullsum += sg.sum;
        sg.data.forEach((val, idx) => mockData[idx] = (mockData[idx] || 0) + val);
    });
    let coalitionSubgroup = {
        data: mockData,
        key: 'coal',
        name: (selectSGs.length > 1 ? 'Coalition' : (selectSGs[0] || {name: 'None'}).name),
        getAbbreviation: () => "Coalition",
        getFractionInPart: (p) => {
            let portion = 0;
            selectSGs.forEach((selected) => {
                portion += selected.getFractionInPart(p);
            });
            return portion;
        },
        fractionAsMapboxExpression: () => [
          "/",
          ["+"].concat(selectSGs.map(sg => ["get", sg.key])),
          columnSet.subgroups[0].total.asMapboxExpression()
        ],
        sum: fullsum,
        total: columnSet.subgroups[0].total
    };

    let mockColumnSet = {
      ...columnSet,
      subgroups: [coalitionSubgroup]
    };

    function createLayer(layer) {
        let layerSpec = {
            id: `${layer.id}-overlay-${generateId(8)}`,
            source: layer.sourceId,
            type: layer.type,
            paint: {
                'fill-opacity': 0,
                'fill-color': '#444'
            }
        };
        if (layer.sourceLayer !== undefined) {
            layerSpec["source-layer"] = layer.sourceLayer;
        }
        return new Layer(layer.map, layerSpec, addBelowLabels);
    }
    if (!window.unitLayer) {
        window.unitLayer = createLayer(units);
    } else {
        if (selectSGs.length > 0) {
            window.unitLayer.setPaintProperty('fill-color', [
                "interpolate",
                ["linear"],
                coalitionSubgroup.fractionAsMapboxExpression(),
                0,
                "rgba(0,0,0,0)",
                0.499,
                "rgba(0,0,0,0)",
                0.5,
                "rgba(249,249,249,0)",
                1,
                "orange"
            ]);
        } else {
            window.unitLayer.setPaintProperty('fill-color', 'rgba(0, 0, 0, 0)');
        }
    }

    return html`
        <section class="toolbar-section">
            ${Parameter({
                label: "Components:",
                element: html`<div>
                    ${columnSet.subgroups.map(sg => html`<div style="display:inline-block;border:1px solid silver;padding:4px;border-radius:4px;cursor:pointer;">
                        ${toggle(sg.name, false, checked =>
                            dispatch(actions.selectCoalitionPop({
                                chart: chartId,
                                subgroup: sg
                            })),
                            "toggle_" + sg.key
                        )}
                    </div>`)}
                </div>`
            })}
            ${toggle("Map coalition majorities", false, (checked) => {
                window.unitLayer.setOpacity(checked ? 0.4 : 0);
            })}
            ${visibleParts.length > 1
                ? Parameter({
                      label: "Community:",
                      element: Select(visibleParts, i =>
                          dispatch(
                              actions.selectPart({
                                  chart: chartId,
                                  partIndex: i
                              })
                          )
                      )
                  })
                : ""}
            ${DistrictEvaluationTable(
                mockColumnSet,
                placeName,
                parts[uiState.charts[chartId].activePartIndex]
            )}
        </section>
    `;
};
