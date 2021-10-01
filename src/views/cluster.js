
import { html, render } from "lit-html";


/**
 * @description Creates a header for the data page.
 * @param {object} cluster districtr-interpretable cluster object.
 * @returns {HTMLTemplateElement}
 */
function createTitle(cluster) {
    let title = cluster["name"],
        clusterID = cluster["id"],
        description = cluster["description"];

    return html`
        <h2 class="cluster-page__header">Cluster ${clusterID} – ${title}</h2>
        <p class="cluster-page__description">${description}</p>
    `;
}

/**
 * @description Renders the cluster data view.
 */
export default function renderClusterDataView() {
    // Grab the cluster information and create a title.
    let { cluster, portal } = JSON.parse(window.localStorage.getItem("coidata")),
        titleEntity = Array.from(document.getElementsByClassName("title"))[0],
        title = createTitle(cluster);

    // Render the title.
    render(title, titleEntity);

    // Create a DataTable.
    let tableEntity = Array.from(document.getElementsByClassName("table-container"))[0],
        variableNames = [
            "Portal Link", "Overall Submission Information", "Individual Area Information"
        ],
        table; 
        
    table = html`
        <table class="data-table">
            <col style="width: 7%">
            <col style="width: 46%">
            <col style="width: 46%">
            <thead>
                ${
                    variableNames.map((name) => 
                        html`<th class="data-table__column-heading" colSpan=1>${name}`
                    )
                }
            </thead>
            <tbody>
                ${
                    cluster["submissions"].map((s) => {
                        let description = s["description"] == "0" ?
                                html`<i style="font-size: 0.8em">No description provided.</i>` :
                                s["description"],
                            areaText = s["areatext"] == "0" | s["areatext"] == "" ?
                                html`<i style="font-size: 0.8em">No description provided.</i>` :
                                s["areatext"];
                        return html`
                            <tr>
                                <td class="ui-data data-table__cell" style="text-align: center;">
                                    <a target="_blank" href="${portal}/submission/${s['cluster_id']}">${s['cluster_id']}</a>
                                </td>
                                <td class="ui-data data-table__cell" style="padding: 0.9em; font-size: 0.9em; text-align: left;">
                                    <strong>${s['title']}.</strong> ${description}
                                </td>
                                <td class="ui-data data-table__cell" style="padding: 0.9em; font-size: 0.9em; text-align: left;">
                                    <strong>${s['areaname']}.</strong> ${areaText}
                                </td>
                            </tr>
                        `
                    })
                }
            </tbody>
        </table>
    `;

    // Render the table.
    render(table, tableEntity);
}

