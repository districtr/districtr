# Things are organized funny


### state.md

On Mon., Apr. 22, 2019, [@maxhully] suggested that this State class be
broken up, as mentioned above.

```
// We should break this up. Maybe like this:
// [ ] MapState (map, layers)
// [ ] DistrictData (column sets) ?
// [x] DistrictingPlan (assignment, problem, export()) ?
// [ ] Units (unitsRecord, reference to layer?) ? <--- really need this
one
// "place" is mostly split up into these categories now.
```

Finally, `State.initializeMapState(...)` calls and returns from only one
function. Is it needed?

### Layer
- Given the nearly two dozen ways layers are created, there's surely a
way to categorize and standardize the creation of layers with a more
predictable form.
- `Layer` objects and a `layer` specification object are titled in such
a way that it is easy to confuse

### Number Markers
- Note that exceptions for Louisiana, Mass. Towns, Indian Precincts and
El Paso, TX is hard coded in the code. Perhaps a global 'placeID'
function could consolidate or correction of Louisiana data could
consolidate this. 
- Icons are generated using Javscript Canvas. Could these also be
generated SVG or even CSS to simplify the code? 


### Actions Reducers
Many reducer functions are listed in `utils`. They're relatively simple. Can they be
listed in the `reducers/` folder for clarity instead?

### BrushEraseTools
- We should go ahead and set a default value for the `renderToolbar` parameter in `BrushToolOptions`,
as it is always set to `undefined` when it is called. In fact, it is called in each of the `BrushToolOptions`' instance methods and is ultimately set to re-render the Editor when the `BrushTool` is added by to the `Toolbar` by the `addTool(...)` function. 

### Modal
- Small snippets of code is saved in a multitude of html files and folders. Could this be combined as
say, a JSON, for simplicity?### Modal
- `savePlanToDB` is passed into the `renderSaveModal(...)` by `Toolbar`, but this is the same 
function as in `routes`. Could this be made into a global method?

###Toolbar

- In `savePlan()`, `btn` is retrieved and defined three times near identically. Is there a difference
between these calls and can this function be rewritten to reduce this redundancy?

- Tabs are only effectively called here, yet is passed in `this.tabs`, `this.store.state`, etc.
Could tabs just be passed in `this,` the `Toolbar` and handle the rest?

### Tools Plugin
  - Menu words are chosen on `community` type

  ### Tools Plugin

- Since the `Toolbar` is created in `Editor` after the `State` object is created and `Menu` only relies on problem/context
`State` to provide a list of menu options, should Menu functionality be separated out into a different file?


### Top Menu

`Menu` does so much by itself, I think it deserve a separate file from both the `Toolbar`, `tools-plugin.js`. The
menu and its options are loaded only once and the options change little from context to context.

### UI State Store

- If we use a series of dispatch events to rerender different pieces of the document, do we
need to call `renderToolbar` in the methods of `brushTool`? 

### Brush

- Functions `colorfeatures(...)` works in service to the heftier function
`_colorfeatures(...)`. Could we just rename these two such that the
first function, which selects the appropriate filter, is a helper
instead of a gateway?

- The sprawling function `_colorFeatures(...)` investigates both
individual units and whole counties. Could we separate these two into
separate functions?

- Every time `this.changedColors` is cleared, it is pointed to a 
`new Set()` javascript object, which starts out empty. This creates
many `Set` objects with each you. Though the memory savings on reusing
the same object are miniscule, wouldn't it be clearer to use function 
`clear(...)` on the original object?

### Landmarks Class
- Should the listeners in the constructor be deanonymized and turned into helper
functions?

### Find Places
- Function `placeItems(...)` was once used in `PlacesList` but is now
only used when view `event.js` produces cards for plans. Could this be
similar to the cards already generated in landing pages elsewhere?

### COI
- Most ways COI mode is conditioned upon is for simple labels. Maybe we could create a
simple labels object and condition only once. 

### Data Layers Plugin
- `vapEquivalents` is a reference table that converts standard census population codes
into vap codes. Could this constant be kept above or folded into
`../components/Charts/CoalitionPivotTable`?

- Many table types reimplement `getBackgroundColor` and `getCellStyle` identically.
This, along with the `popNumber` formatter can be collected in its own utils file. 

### Demographics Table
- `mockColumnSet` can be written as its own helper function in `evaluation-plugin.js`. 

### Evaluation Plugin
- Initial `isOpen` states can be delegated to a helper function.

### Evaluation Plugin
- Separate out VRAtab as new plugin. 


### Pop Balance Plugin 
- So much is similar with single and multimember districts, we could use in-line if statements_
- Both Population Deviation and Unassigned Population are short and can be combined in the pop-balance-plugin file_
- ZoomToUnassigned should be moved to Unassigned.js 


### ColumnSet Parts
- Class `SumOfColumns` is so similar to `NumericalColumn` and `Subgroup` that it
could extend or be rolled into one of these classes


### ColumnSet Parts
- Philosophically, I think `State` should be responsible for the addition of its
own columnsets with a function like `addColumnSet(...)`. I also think that state should
initialize blank versions of any of its instance variables at the onset for clarity's
sake.

- Why is `src/models/lib` its own folder

### DataTable

The `PivotTable` and the `CoalitionPivotTable` are both very similar
implementations of `DataTable`. Is there a way that `CoalitionPivotTable`
could inherit from `PivotTable` or extend `PivotTable` to include
coalition properties?

- Thus, `totals_only` in `CoalitionPivotTable` is only set to true, 
making `CoalitionPivotTable` even more similar to `PivotTable`


### ElectionResults

In `PartisanOverlayContainer`, a checkbox element is hard coded. Could
we use the `Toggle` object instead?

### Highlight Unassigned

- The `PopBalancePlugin` creates a function, `zoomToUnassigned` that is
always used with `HighlightUnassigned`. Thus, it makes more sense to have
that function written in that file. 

### Highlight Unassigned

- `zoomToUnassigned` is the only function outside of `routes.js` that
talks to the PythonAnywhere. For clarity sake, this call should be
collected in one file. 

## Histogram

There are only two kinds of Histograms, one for age and one for income.
They are used in separate plugins through two complete separate functions.
Thus, for clarity sake, logic around `isAge` could be abstracted to
the separate functions alone, leaving Histogram a more generic object.

# VRA

- Names are abbreviated based on VRA. Could they be abbreviated by a toolbar value, 
number-of-tabs, to make this more universal?


- The biggest note is the fact that `EvaluationPlugin` is now responsible for
creating __two__ tabs. If `VRA` makes a second tab, it should be made into its
own plugin.

### State Portals

- So many anonymous functions are used to render `html`. Perhaps a few longer ones can
be separated out as helper functions


### State Portals
- The population of districting and community cards occurs later than when it
is given structure in the HTML. Maybe they should be placed closer together for
clarity.
### Routes

- So much occurs when `loadPlanFromJSON(...)` and `loadPlanFromCSV(...)`
returns the response from `listPlaces`, that helper functions could be 
written to help clarity

### DataTable
_why is coalitionSubgroup not created with a subgroup model?_ 
