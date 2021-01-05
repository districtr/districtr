import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Select from "../Select";
import Parameter from "../Parameter";
import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";

function getBackgroundColor(value) {
    return `rgba(0, 0, 0, ${Math.min(
        roundToDecimal(Math.max(value, 0) * 0.98 + 0.02, 2),
        1
    )})`;
}

function getCellStyle(value) {
    const background = getBackgroundColor(value);
    const color = value > 0.4 ? "white" : "black";
    return `background: ${background}; color: ${color}`;
}

function getCell(value, width, decimals, simple=false) {
    // const value = subgroup.values(part.id)
    return {
        content: `${roundToDecimal(value * 100, decimals ? 1 : 0)}%`,
        style: simple ? `background: white; color: black` : getCellStyle(value) + `; width: ${width}`
    };
}

function getTextCell(value, width) {
    return {
        content: `${value.split("D_")[0]}`,
        style: `background: white; color: black; width: ${width}`
    };
}

function getRankCell(elect, width) {
    const place = elect.CoC_place;
    const majority = elect.FirstPlace[1] > 0.5;
    const moveon = place === 1 || (place === 2 && !majority)
    const background = moveon ? "limegreen" : "white";
    const color = place < 3 ? "black" : "red"
    const suffix = majority ? "M" : "P";
    return {
        content: `${place < 3 ? place + suffix : "X"}`,
        style: `background: ${background}; color: ${color}; width: ${width}`
    };
}

function getElectLable(elect) {
    const electionAbrev = {"19Governor": ["GOV19", "2019 Govenor"], "19Lt_Governor": ["LTG19", "2019 Lt. Govenor"], 
                           "19Treasurer": ["TRES19", "2019 Treasurer"], "19Ag_Comm": ["AGC19", "2019 Commissioner of Agriculture and Forestry"], 
                           "18SOS": ["SOS18", "2018 Secretary of State"], "17Treasurer": ["TRES17", "2017 Treasurer"], 
                           "16US_Sen": ["SEN16", "2016 US Senate"], "16_President": ["PRES16", "2016 US President"], 
                           "15_Governor":["GOV15", "2015 Govenor"], "15_SOS": ["SOS15", "2015 Secratary of State"], 
                           "15_Treasurer": ["TRES15", "2015 Treasurer"]};
    
    const name = electionAbrev[elect.name] ? electionAbrev[elect.name][0] : elect.name;
    const desc = electionAbrev[elect.name] ? electionAbrev[elect.name][1] : "";
    return html`
        <div class="elect_tooltip">${name}
            <span class="elect_tooltiptext">${desc}</span>
        </div>
    `;
    
    
}



function getPrimTable(dist, elects, decimals=true) {
    const headers = [dist.renderLabel(),"CoC", "Group Control", "Rank", "%"]; //subgroups.map(subgroup => subgroup.name);
    const width = `${Math.round(81 / headers.length)}%`;
    let rows = elects.map(elect => ({
        label: getElectLable(elect),
        entries: [getTextCell(elect.CoC, width), 
                  getCell(elect.GroupControl, width, decimals, true),
                  getRankCell(elect, width), 
                  getCell(elect.CoC_perc, width, decimals)
                ]
    }));
    return DataTable(headers, rows, true);
}

function getGenTable(dist, elects, decimals=true) {
    const headers = [dist.renderLabel(),"Proxy CoC", "Success", "%"]; //subgroups.map(subgroup => subgroup.name);
    const width = `${Math.round(81 / headers.length)}%`;
    let rows = elects.map(elect => ({
        label: getElectLable(elect),
        entries: [getTextCell(elect.CoC, width), 
                  getRankCell(elect, width), 
                  getCell(elect.CoC_perc, width, decimals)
                ]
    }));
    return DataTable(headers, rows, true);
}

function DistrictResults(effectiveness, dist) {
    return html`
        <div class="ui-option ui-option--slim">
            <h5> Primary Elections Breakdown</h5>
        </div>
        <section class="toolbar-section">
            ${effectiveness[dist.id] ? getPrimTable(dist, effectiveness[dist.id].electionDetails) : ""}
            <ul class="option-list">
                <li class="option-list__item">
                    * M indicates that the first place candidate recieved a majority of the votes. </br>
                    * P indicates that they won the primary with a plurality of votes.
                </li>
            </ul>
        </section>
        
        <div class="ui-option ui-option--slim">
            <h5> General Elections Breakdown</h5>
        </div>
        <section class="toolbar-section">
            ${effectiveness[dist.id] ? getGenTable(dist, effectiveness[dist.id].electionDetails) : ""}
        </section>
    `;
}

function SelectDist(dists, handler, selectedIndex) {
    return html`
        <select @change="${e => handler(parseInt(e.target.value))}">
            ${dists.map(
                (d, i) => html`
                    <option value="${i}" ?selected=${selectedIndex === i}
                        >${d.displayNumber}</option
                    >
                `
            )}
        </select>
    `;
}

export default function VRAResultsSection(
    chartID,
    parts,
    effectiveness,
    uiState,
    dispatch
) {
    // console.log(effectiveness);
    // console.log(parts);
    return html`
        <section class="toolbar-section">
            ${Parameter({
                label: "District:",
                element: SelectDist(parts, i =>
                    dispatch(
                        actions.selectPart({
                            chart: chartID,
                            partIndex: i
                        })
                    ),
                )
            })}
            ${DistrictResults(
                effectiveness,
                parts[uiState.charts[chartID].activePartIndex]
            )}
        </section>
    `;
}