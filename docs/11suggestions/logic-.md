# Some things Dont get called due to upstream logic


- GET functions can only process up to 100 district when generating
district centroids.
- A simple way to select 100 random objects in a list is through taking
a slice of `[...array].sort(() => 0.5 - Math.random());`. For the
largest numbers, this method is not terribly fast or evenly distributed
but is very simple.
- Meanwhile, it appears that `check_district(d_index)` only checks one
district at a time. This implies that the selection of 100 random
districts should occur before and outside the function. 

### Tools Plugin
- The logic for selecting which tools to plug in, based on `state.problem`, `spatial_abilities` and more, are scattered throughout
the code. Is there a way to consolidate this logic?
### Tools Plugin
  - In `view/edit.js`, before the `State` is created, `context.problem.type` determines the list of plugins to load. No matter the
 logic, `tools-plugin` is always loaded, while other plugins are swapped in and out.
 ### Tools Plugin
  - Within ` tools-plugin`, different kinds of `Brush` are created whether the `state.problem.type` is community or not. 
  ### Tools Plugin
  - `state.problem.type` is passed in as a `brushOption` even if the Brush is already of `CommunityBrush` or regular `Brush` type.
  ### Tools Plugin
  - Contiguity Check and VRA does not apply in `community` mode

  ### Tools Plugin
   - The`showVRA` option is defined twice. The `VRAEffectiveness` module is loaded if `vra` mode is applied. 

   
### Brush
- Checking if `feature.state.color` is null or undefined or
`isNan(...)` is redundant, they are equivalent statements

- Condition `part !=== null` is redundant, as a null `part` is equivalent to `false`.
While `null` and `undefined` are equivalent, they are used as conditions in their own
right elsewhere in the code. 
- `mockColumnSet` can be written 

### Brush
- Much effort is done to ensure that the color type is `Number`.
What is the reason it would ever be passed around as a string? We could
guarantee that the color is a Number throughout.

### Find Places

Currently, the role of `findPlaces.js` is to find
and match modules. This requires traversing the
entire folder of modules. This takes a lot of effort
but is done only once, so we live it. 

Object `spatial_abilities` is the next closest thing
to a master list of modules. Instead of using an 
API, could we extend `spatial_abilities` such that it is a master list of modules?

For instance, we expend effort trying to extract modules related to
communities and localities, though in other parts of the code, this is
handled by `spatial_exceptions`.

We see the benefits of this when considering the
function `lookupState` from `lookupOldState.js`, used
by `listPlaces.js`, where modules are matched up to the 
state they belong to, but this function is not updated 
when new modules are added. 

### Data Layers Plugin
- Since `edit.js` lists plugins to load by `problem.type`, it is redundant to
have so many use cases depend on the difference between `districting` and `community`
modes. With the proper management of helper functions, it's probably easier to just
write two separate data plugins for districting and coi modes.
- This sprawling functions has become so because of the many, many hard coded cases
and exceptions for loading a variety of similar layers. Surely, one can imagine
consolidating loadable layers in a director, say `spatial-abilities` itself, and
creating a `makeGenericLayer` class to read in sources, labels, and so on. This could
cut the amount of code by half. 
- A result of having so many use cases is that the places where json source data loads
and where it is added as a layer and toggle button is separated. This makes it hard to
see that, say, the ids `lax`'s current 2013 districts' source in the map is titled,
with `va` instead of `lax.`

- When rendering the rent overlay legend bars, the notches are rendered inside a 
div class '.vap' and not say `.rent`.
- When loading early city example Lowell, MA, is loaded a hard coded coalition is written
as default. Maybe this can be removed or moved to `spatial_abilities.` 


### Data Set Info
- Is there a way we can handle these special cases and special language in `spatial_abiliies`?

### Demographics Table
- `RacialBalanceTable` hard codes a special case for 2018 and 2019 data.

### Evaluation Plugin
- Two equivalent if statements `state.elections.length > 0` should be
combined.

### Evaluation Plugin
- One can simplify the contiguity if statement as this plugin is never 
called if `problem.type` is "community"

### Population

Both `indiciesOfMajorSubgroups()` and `RacialBalanceTable` filter out 2018 and 2019
data. Could this be consolidated?

### ColumnSet Parts
- In function `getColumnSets(...)`, if statements check each type of columnset,
like `if (state.vap)` twice. Could this condition be folded into itself so that
it is called once?

## Histogram
There are eight places where `isAge` is tested in Histogram. 


- The Reveal Section on "VRA Effectiveness" conditions against using `ma_towns`, 
yet there should be no case where `ma_towns` is used with showVRA as it is not
included in the portal. Thus, this is redundant logic.

## Tooltip
_this.render() occurs twice if this happens._