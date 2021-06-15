# Population Balance Plugin

The `PopulationBalancePlugin` is loaded by `edit.js` and is included in the list
of default plugins, i.e., when painting districts and not communities. A `Tab`
of id `criteria` titled "Pop." or "Population" is loaded in the `Toolbar` using
the default function, requiring only the main `editor` as an argument. 

Its typical function is to 
- report [information about the dataset],
- produce a [PopulationBarChart]
- cause the calculation and display of the unassigned population
- cause the calculation and display of the population deviation. 

In the rare case we are working with multimember districts as we do only 
in the Chicago, IL or Santa Clara, CA City Council and the Vermont State Senate,
a MultiMemberPopBalanceChart is used instead and no Population Deviation is
calculated. 

> The zoomToUnassigned function also lives here. 

## Unassigned Population

The entire `UnassignedPopulation.js` code is listed below. 

```
import { html } from "lit-html";
import { numberWithCommas, sum } from "../../utils";

export default population => {
    const totalAssignedPop = sum(population.total.data);
    const unassignedPop = Math.round(population.total.sum - totalAssignedPop);
    return html`
        <div class="ui-option ui-option--slim">
            <dt class="ui-label ui-label--row">Unassigned population:</dt>
            <dd class="ui-data">${numberWithCommas(unassignedPop)}</dd>
        </div>
    `;
};
```

The sum of the districts and the total sum of population is calculated from `state.population`
and displayed.

## Population Deviation

With the same imports as above, the entire `PopulationDeviation.js` code is listed below.

```
export default population => {
    let deviations = population
        .deviations()
        .filter(d => d != -1) // leave out empty districts
        .map(d => Math.abs(d));
    if (deviations.length == 0) {
        deviations.push(1);
    }
    const maxPopDev = Math.max(...deviations);
    return html`
        <div class="ui-option ui-option--slim">
            <dt class="ui-label">Max. population deviation:</dt>
            <dd class="ui-data">${roundToDecimal(maxPopDev * 100, 2)}%</dd>
        </div>
    `;
};
```
This function uses `Population`'s instance variable to produce deviations for each district.
The maximum absolute deviation across all districts is represented as a percentage.

# #

### Suggestions 

- So much is similar with single and multimember districts, we could use in-line if statements_
- Both Population Deviation and Unassigned Population are short and can be combined in the pop-balance-plugin file_
- ZoomToUnassigned should be moved to Unassigned.js 
