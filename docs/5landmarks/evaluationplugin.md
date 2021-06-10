# The Evaluation Plugin 

The `EvaluationPlugin` is part of the default plugins loaded
when the aim is to draw a plan with districts, as opposed to
drawing communities. The tab's primary responsibility is to
hold data tables that calculate population or partisanship
across drawn districts. Controls for displaying contiguity
is also found here. 

Began as part of plugins pack, April 23, 2019 by @maxhully.
Maintained by [@mapmeld] since March, 2020, who added contiguity
check in March and Age Table in April. [@jenni-niels] adds VRA
functionality in the Spring of 2021 and both maintain with help
from [@jdeschler] ever since.

## /src/plugins/evaluation-plugin.js 

The evaluation tab runs through an `editor`'s `state` 
context/plan through series of case conditions that
determine what components to load in the "Evaluation"
tab of the `Toolbar`. 

First, a `mockColumnSet` is cretaed to include a user-specified
coalition in the columns of a population. Then each component
is loaded by condition. 

- Default Reveal Section "Population by Race" featuring
`RacialBalanceTable` including `mockColumnSet` 
- "Voting Age Population by Race" `RacialBalanceTable` if `state.vap`
- "Citizen Voting Age Population by Race" `RacialBalanceTable` if `state.cvap`
- "Partisan Balance Summary" `PartisanSummarysection` if any `state.elections`
  - "Election Details" `ElectionResultsSection` if any `state.elections`
  - "Age Histograms" `AgeHistogramTable` if `state.ages`
- `ContiguitySection` if permitted by `spatial_abilities` and is not
`ma_towns`. 
- Other Tabs Related to VRA

# #

### Suggestions

- Two equivalent if statements `state.elections.length > 0` should be
combined.
- Initial `isOpen` states can be delegated to a helper function.
- One can simplify the contiguity if statement as this plugin is never 
called if `problem.type` is "community"
- Separate out VRAtab as new plugin. 
