import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Select from "../Select";
import Parameter from "../Parameter";
import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";

const electionAbrev = { // 2019
                        "19Governor": ["GOV19", "2019 Governor"], "19Lt_Governor": ["LTG19", "2019 Lt. Governor"], 
                        "19Treasurer": ["TRES19", "2019 Treasurer"], 
                        "19Ag_Comm": ["AGC19", "2019 Commissioner of Agriculture and Forestry"],
                        // 2018
                        "18SOS": ["SOS18", "2018 Secretary of State"], "18Governor": ["GOV18", "2018 Governor"], 
                        "18RR_Comm_1": ["RRC18", "2018 Railroad Commissioner"], "18Lt_Governor": ["LTG18", "2018 Lt. Governor"],
                        "18Comptroller": ["COMP18", "2018 Comptroller"], "18US_Sen": ["SEN18", "2018 US Senate"],
                        "18Land_Comm": ["PLC18", "2018 Public Lands Commissioner"],
                        // 2017
                        "17Treasurer": ["TRES17", "2017 Treasurer"], 
                        // 2016
                        "16US_Sen": ["SEN16", "2016 US Senate"], "16_President": ["PRES16", "2016 US President"], 
                        "16RR_Comm_1": ["RRC16", "2016 Railroad Commissioner"], "16President": ["PRES16", "2016 US President"], 
                        // 2015
                        "15_Governor":["GOV15", "2015 Governor"], "15_SOS": ["SOS15", "2015 Secretary of State"], 
                        "15_Treasurer": ["TRES15", "2015 Treasurer"],
                        // 2014
                        "14US_Sen": ["SEN14", "2014 US Senate"], "14RR_Comm_3": ["RRC14", "2014 Railroad Commissioner"],
                        "14Ag_Comm": ["AGC14", "2014 Agriculture Commissioner"], "14Governor": ["GOV14", "2014 Governor"],
                        // 2012
                        "12President": ["PRES12", "2012 President"],  "12US_Sen": ["SEN12", "2012 US Senate"],
                    };

const candNames = { // 2019
                    "EdwardsD_19G_Governor": "J. Edwards (W)","EdwardsD_19P_Governor": "J. Edwards (W)",
                    "JonesD_19P_Lt_Governor": "W. Jones (B)", "EdwardsD_19P_Treasurer": "D. Edwards (B)",
                    "GreenD_19P_Ag_Comm": "M. Green (W)",
                    // 2018
                    "GreenupD_18G_SOS": "G. Collins-Greenup (B)","GreenupD_18P_SOS": "G. Collins-Greenup (B)",
                    "ORourkeD_18P_US_Sen": "B. ORourke (W)", "ORourkeD_18G_US_Sen": "B. ORourke (W)",
                    "ValdezD_18P_Governor": "L. Valdez (H)", "ValdezD_18R_Governor": "L. Valdez (H)", "ValdezD_18G_Governor": "L. Valdez (H)",
                    "WhiteD_18P_Governor": "A. White (W)", "WhiteD_18R_Governor": "A. White (W)",
                    "SuazoD_18P_Land_Comm": "M. Suazo (H)", "SuazoD_18G_Land_Comm": "M. Suazo (H)",
                    "MahoneyD_18P_Comptroller": "T. Mahoney (W)",
                    "CooperD_18P_Lt_Governor": "M. Cooper (B)",
                    "SpellmonD_18P_RR_Comm_1": "C. Spellmon (B)",
                    "McAllenD_18P_RR_Comm_1": "R. McAllen (H)", "McAllenD_18G_RR_Comm_1": "R. McAllen (H)",
                    "CollierD_18P_Lt_Governor": "M. Collier (W)", "CollierD_18G_Lt_Governor": "M. Collier (W)",
                    "ChevalierD_18P_Comptroller": "J. Chevalier (B)", "ChevalierD_18G_Comptroller": "J. Chevalier (B)",
                    // 2017
                    "EdwardsD_17G_Treasurer": "D. Edwards (B)", "EdwardsD_17P_Treasurer": "D. Edwards (B)",
                    // 2016
                    "CampbellD_16G_US_Sen": "F. Campbell (W)", "CampbellD_16P_US_Sen": "F. Campbell (W)",
                    "ClintonD_16G_President": "H. Clinton (W)", "ClintonD_16P_President": "H. Clinton (W)",
                    "YarbroughD_16P_RR_Comm_1": "G. Yarbrough (B)",  "YarbroughD_16R_RR_Comm_1": "G. Yarbrough (B)","YarbroughD_16G_RR_Comm_1": "G. Yarbrough (B)",
                    // 2015
                    "EdwardsD_15P_Governor": "J. Edwards (W)", "EdwardsD_15G_Governor": "J. Edwards (W)",
                    "TysonD_15P_SOS": "C. Tyson (B)",
                    // 2014
                    "AlameelD_14P_US_Sen": "D. Alamee (W)", "AlameelD_14R_US_Sen": "D. Alamee (W)", "AlameelD_14G_US_Sen": "D. Alamee (W)",
                    "HoganD_14P_Ag_Comm": "J. Hogan (W)", "HoganD_14R_Ag_Comm": "J. Hogan (W)", "HoganD_14G_Ag_Comm": "J. Hogan (W)",
                    "DavisD_14P_Governor": "W. Davis (W)", "DavisD_14G_Governor": "W. Davis (W)", 
                    "BrownD_14P_RR_Comm_3": "S. Brown (B)", "BrownD_14G_RR_Comm_3": "S. Brown (B)",
                    "FriedmanD_14P_Ag_Comm": "R. Friedman (W)",
                    // 2012
                    "ObamaD_12P_President": "B. Obama (B)", "ObamaD_12G_President": "B. Obama (B)",
                    "SadlerD_12P_US_Sen": "P. Sadler (W)", "SadlerD_12R_US_Sen": "P. Sadler (W)", "SadlerD_12G_US_Sen": "P. Sadler (W)",
                };

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
        style: (simple ? `color: black` : getCellStyle(value)) + `; width: ${width}; text-align: center;`
    };
}

function getTextCell(value, width) {
    return {
        content: candNames[value] ? candNames[value] : value, //`${value.split("D_")[0]}`,
        style: `background: white; color: black; width: ${width}; text-align: center;`
    };
}

function getRankCell(elect, width) {
    const place = elect.CoC_place;
    const majority = elect.FirstPlace[1] > 0.5;
    const moveon = place === 1 || (place === 2 && !majority)
    const background = moveon ? "limegreen" : "";
    const color = place < 3 ? "black" : "red"
    const suffix = majority ? "M" : "P";
    const desc = place < 3 ? (place === 1 ? "1st" : "2nd") + " place " + (majority ? "(majority)" : "(plurality)") : ""

    return {
        content: html`<div class="elect_tooltip">
                        ${place < 3 ? html`${place + suffix} <span class="elect_tooltiptext">${desc}</span>` 
                                    : "✘"}
                     </div>`,
        style: `background: ${background}; color: ${color}; width: ${width}; text-align: center;`
    };
}

function getElectLabel(elect) {
    const name = electionAbrev[elect.name] ? electionAbrev[elect.name][0] : elect.name;
    const desc = electionAbrev[elect.name] ? electionAbrev[elect.name][1] : "";
    return html`
        <div class="elect_tooltip">${name}
            <span class="elect_tooltiptext">${desc}</span>
        </div>
    `;
    
    
}

function getGenSuccessCell(vote_perc, width) {
    const color = vote_perc > 0.5 ? "limegreen" : "red";
    const mark =  vote_perc > 0.5 ? `✔` : `✘`;
    return {
        content: `${mark}`,
        style: `color: ${color}; width: ${width}; text-align: center;`
    };
}

const cocHeader = (group, proxy=false) => html`<div class="elect_tooltip">${proxy ? "Proxy" : ""} CoC
                                    <span class="elect_tooltiptext">${proxy ? "Proxy" : ""} ${group} Candidate of Choice</span>
                                </div>`;

function sortElects(elects) {
    // console.log(elects);
    const name = elect => electionAbrev[elect.name] ? electionAbrev[elect.name][1] : elect.name;
    let sorted = elects.sort((e1,e2) => name(e2).localeCompare(name(e1)));
    // console.log(sorted);
    return sorted;
}

function getPrimTable(dist, elects, group, decimals=true) {
    const groupControlHeader = html`<div class="elect_tooltip">Group Control
                                            <div class="elect_tooltiptext">Estimated ${group} share in the support received by CoC</div>
                                    </div>`;
    const headers = [dist.renderLabel(),cocHeader(group), "District Vote %", "Rank", "Out Of", groupControlHeader]; //subgroups.map(subgroup => subgroup.name);
    const width = `${Math.round(81 / headers.length)}%`;
    let rows = sortElects(elects).map(elect => ({
        label: getElectLabel(elect),
        entries: [getTextCell(elect.CoC, width*1.75), 
                  getCell(elect.CoC_perc, width, decimals),
                  getRankCell(elect, width), 
                  getTextCell(elect.numCands, width/2), 
                  getCell(elect.GroupControl, width, decimals, true),
                ]
    }));
    return DataTable(headers, rows, true);
}

function getGenTable(dist, elects, group, proxy=true, decimals=true) {
    const headers = [dist.renderLabel(), cocHeader(group, proxy), "District Vote %", "Success"]; //subgroups.map(subgroup => subgroup.name);
    const width = `${Math.round(81 / headers.length)}%`;
    let rows = sortElects(elects).map(elect => ({
        label: getElectLabel(elect),
        entries: [elect.CoC_proxy_gen ? getTextCell(elect.CoC_proxy_gen, width*2.25) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width*2.25}; text-align: center;`}, 
                  elect.CoC_proxy_gen ? getCell(elect.proxy_perc_gen, width, decimals) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width}; text-align: center;`},
                  elect.CoC_proxy_gen ? getGenSuccessCell(elect.proxy_perc_gen, width) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width}; text-align: center;`},
                ]
    }));
    return DataTable(headers, rows, true);
}

function getRunoffTable(dist, elects, group,  decimals=true) {
    const headers = [dist.renderLabel(), cocHeader(group), "District Vote %", "Success"]; //subgroups.map(subgroup => subgroup.name);
    const width = `${Math.round(81 / headers.length)}%`;
    let rows = sortElects(elects).map(elect => ({
        label: getElectLabel(elect),
        entries: [elect.CoC_proxy_ro ? getTextCell(elect.CoC_proxy_ro, width*2.25) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width*2.25}; text-align: center;`}, 
                  elect.CoC_proxy_ro ? getCell(elect.proxy_perc_ro, width, decimals) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width}; text-align: center;`},
                  elect.CoC_proxy_ro ? getGenSuccessCell(elect.proxy_perc_ro, width) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width}; text-align: center;`},
                ]
    }));
    return DataTable(headers, rows, true);
}

function DistrictResults(effectiveness, dist, group, place) {
    // const group = groups[group_index];
    const runoffs = ["tx_vra"].includes(place);
    const proxy = ! ["la_vra"].includes(place);
    // console.log(place);
    // console.log(group);
    return html`
        <div class="ui-option ui-option--slim">
            <h5> Primary Elections Breakdown</h5>
        </div>
        <section class="toolbar-section">
            ${effectiveness[group][dist.id] ? getPrimTable(dist, effectiveness[group][dist.id].electionDetails, group) : ""}
        </section>
        ${runoffs ? html`<div class="ui-option ui-option--slim">
                            <h5> Runoff Elections Breakdown</h5>
                        </div>
                        <section class="toolbar-section">
                            ${effectiveness[group][dist.id] ? getRunoffTable(dist, effectiveness[group][dist.id].electionDetails, group) : ""}
                        </section>` 
                  : html``}
        <div class="ui-option ui-option--slim">
            <h5> General Elections Breakdown</h5>
        </div>
        <section class="toolbar-section">
            ${effectiveness[group][dist.id] ? getGenTable(dist, effectiveness[group][dist.id].electionDetails, group, proxy) : ""}
        </section>
    `;
}

function SelectBoxes(chartId, dists, groups, activeSubgroupIndices, dispatch) {
    const onChange = j => i =>
        dispatch(
            actions.selectSubgroup({
                chart: chartId,
                subgroupIndex: i,
                subgroupPosition: j
            })
        );
    // console.log(activeSubgroupIndices);

    return [
        Parameter({
                label: "District:",
                element: Select(dists.map(d => {return {name: d.displayNumber};}),
                onChange(0), activeSubgroupIndices[0])
            }),
        Parameter({
            label: "Minority Group:",
            element: Select(groups.map(g => {return {name: g};}),
            onChange(1), activeSubgroupIndices[1])
        })
    ];
}

export default function VRAResultsSection(
    chartID,
    parts,
    effectiveness,
    placeId,
    uiState,
    dispatch
) {
    const groups = Object.keys(effectiveness);
    // console.log(uiState);

    return html`
        <section class="toolbar-section">
            ${SelectBoxes(
                chartID,
                parts,
                groups,
                uiState.charts[chartID].activeSubgroupIndices,
                dispatch
            )}
            ${DistrictResults(effectiveness, parts[uiState.charts[chartID].activeSubgroupIndices[0]],
                              groups[uiState.charts[chartID].activeSubgroupIndices[1]], placeId)}
        </section>
    `;
}