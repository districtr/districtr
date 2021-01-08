import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Select from "../Select";
import Parameter from "../Parameter";
import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";

const electionAbrev = {"19Governor": ["GOV19", "2019 Govenor"], "19Lt_Governor": ["LTG19", "2019 Lt. Govenor"], 
                           "19Treasurer": ["TRES19", "2019 Treasurer"], "19Ag_Comm": ["AGC19", "2019 Commissioner of Agriculture and Forestry"], 
                           "18SOS": ["SOS18", "2018 Secretary of State"], "17Treasurer": ["TRES17", "2017 Treasurer"], 
                           "16US_Sen": ["SEN16", "2016 US Senate"], "16_President": ["PRES16", "2016 US President"], 
                           "15_Governor":["GOV15", "2015 Govenor"], "15_SOS": ["SOS15", "2015 Secratary of State"], 
                           "15_Treasurer": ["TRES15", "2015 Treasurer"]};

const candNames = {"EdwardsD_19G_Governor": "J. Edwards","EdwardsD_19P_Governor": "J. Edwards",
                   "GreenupD_18G_SOS": "G. Collins-Greenup","GreenupD_18P_SOS": "G. Collins-Greenup",
                   "JonesD_19P_Lt_Governor": "W. Jones", "EdwardsD_19P_Treasurer": "D. Edwards",
                   "GreenD_19P_Ag_Comm": "M. Green", "EdwardsD_17G_Treasurer": "D. Edwards",
                   "EdwardsD_17P_Treasurer": "D. Edwards", "CampbellD_16G_US_Sen": "F. Campbell",
                   "CampbellD_16P_US_Sen": "F. Campbell", "ClintonD_16G_President": "H. Clinton",
                   "ClintonD_16P_President": "H. Clinton", "EdwardsD_15P_Governor": "J. Edwards",
                   "EdwardsD_15G_Governor": "J. Edwards", "TysonD_15P_SOS": "C. Tyson",};

// function loadNameData(placeID, callback) {
    
//     $.getJSON( "assets/about/vra/" + placeID + ".json", function( data ) {
//        callback(data);
//     })
//  }


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
    return {
        content: `${place < 3 ? place + suffix : "✘"}`,
        style: `background: ${background}; color: ${color}; width: ${width}; text-align: center;`
    };
}

function getElectLable(elect) {
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



function getPrimTable(dist, elects, decimals=true) {
    const headers = [dist.renderLabel(),"CoC", "Group Control", "Rank", "%"]; //subgroups.map(subgroup => subgroup.name);
    const width = `${Math.round(81 / headers.length)}%`;
    let rows = elects.map(elect => ({
        label: getElectLable(elect),
        entries: [getTextCell(elect.CoC, width*1.75), 
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
        entries: [elect.CoC_proxy ? getTextCell(elect.CoC_proxy, width*2.25) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width*2.25}; text-align: center;`}, 
                  elect.CoC_proxy ? getGenSuccessCell(elect.proxy_perc, width) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width}; text-align: center;`},
                  elect.CoC_proxy ? getCell(elect.proxy_perc, width, decimals) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width}; text-align: center;`},
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
    placeId,
    uiState,
    dispatch
) {
    // console.log(effectiveness);
    // console.log(uiState);
    // let districtRes = DistrictResults.bind(null, effectiveness, parts[uiState.charts[chartID].activePartIndex])
    
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
            ${DistrictResults(effectiveness, parts[uiState.charts[chartID].activePartIndex])}
        </section>
    `;
}