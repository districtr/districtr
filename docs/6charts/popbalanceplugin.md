# Population Balance Plugin

new Tab known as "Population"

add RevealSection "Population Balance"
- if multimember...
    - 
    -
- Otherwise...
    - add poulateDatasetInfo populateDatasetInfo from "../components/Charts/DatasetInfo";
    - PopulationBarChart
    - unassignedPopulation
    - populationDeviation
    - Highlight Unassigned

_populateDatasetInfo(state) is the same for both multimember and regular_