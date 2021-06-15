# Histogram

DataTable

DataTable = (header, rows, left_corner=false)

<div class="age-histogram">
    ${DataTable(new Array(subgroups.length), rows)}
</div>`;

subgroups.length

 label: part.renderLabel(),
        entries: subgroups.map(subgroup => getColumn(subgroup, part, max[part.id], median[part.id], isAge, widthMultiplier))
            .concat([{
                content: median[part.id] ? html`Median:<br/>${fmtIncome(median[part.id], true)}` : "",
            }]

function getColumn(subgroup, part, max, median_name, isAge, widthMultiplier) {
    let years = (subgroup.age_range.length === 1 ? 1 : (subgroup.age_range[1] - subgroup.age_range[0] + 1)),
        width = Math.round(years * (isAge ? 2 : 44)) * widthMultiplier,
        height = Math.ceil(((subgroup.data[part.id] || 1) / (max || 1000000000)) / width * (isAge ? 125 : 2100)),
        is_median = (subgroup.name === median_name);
    return {
      content: html`<div style="background:${is_median ? "#888" : "#444"};width:${width}px; height:${height}px"></div>`,
      style: ""
    }





## Incomehistorgramtable

## AgeHistorgramTable
