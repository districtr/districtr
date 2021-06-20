### Map
- "Units" is used in many ways. Perhaps the units layer could be renamed
for clarity, e.g., `return(units_layer...` instead of
`return (units...`
-`borderId` could be renamed given that it corresponds to `place.id`. 


- This function has line `map = state.units.map`, which is equivalent to
`editor.mapState.map` and each `Layer`'s `map`. 

### Number Markers
- The `NumberMarkers` function generates a new instance variable for
`Editor`. It would be nice to see all `Editor` instance variables
defined at once so that `Editor` is easier to conceptualize. In fact, we
may also be able to generate number-icons at 'Editor' initialization
here. 
Is
`colorsAffected` also equivalent to `brush.changedColors`?


- `Layer` is used to describe its specification object as a parameter to
new  objects of `Layer` class. Would it be clearer to call this
parameter `layerspecs`? 

### Tool
Should we set a default `hide-me` value `false` in the `Tool` constructor to be clear?

### Toolbar
- Toolbar's `this.state`, is not initialized in the constructor.
- Could `OptionsContainer` be renamed `ToolOptionsContainer` for clarity?

### UI Components

- `Parameter` has a confusing name. It behaves like a "DropdownItem".
- It also has a complicated use as it can be sent anything as its 
display object.


### Brush
- It's easier to get one's mind around an object when its instance variables
are defined at the start. This is so for `this._previousColor`,
`this.erasing`, `this.cursorUndo` and `this.trackRedo`.

### Hover

- Within districtr units generally refer to the base precincts or census areas that we use
to build districts. However, within the code base, `units` sometimes refers to these areas
in the plan/context and sometimes to the mapbox `layer`. Maybe using `units` and `unitsLayer`
consistently would be less confusing

- What is a State? A dizzying notion. Is it...
  - The State political unit?
  - The UIState `state` object?
  - The FeatureState, as in the condition properties of a feature?  

### COI
- When one pushes the Important Places "Create" button, its mode cannot be cancelled until
a new landmark is added, which can be deleted right after. 

### Data Set Info
- Directives come from AngularJS, whereas we use lit-html throughout Districtr for templating.
Can't we just use lit-html to populate this text?

### Demographics Table


- When used by `DemographicsTable` and its "descendents", argument `decimals` can hold three values, `true`, `false` and `"population"`. Since `decimals` is no longer a strict
boolean, `true` and `false` should be renamed. 


### Demographics Table
- In `SelectBoxes`, "Comapare" and "with" are contained in an Array, but "and" is a
special case. Should they be in one array?

### Demographics Table
- `AgeHistogramTable`, makes space all possibly districts in the editor, even if there's
many dozens and it takes up space. This is pronounced when Histograms are used.   
_ `AgeHistogramTable` does not create an overall area age breakdown like `RacialBalanceTable`. This may require more involved programming.

### ColumnSet Parts
- It's natural for `column-sets.js` to list all possible columns, but since each
possible columnset is hard coded, lots of work is necesssary if we were to add a
new data type. This is alluded to in the original documentation.

### ColumnSet Parts
   - Actually, within this function, what's the difference between `state.columns` and
the `columnsets` array? 

### Suggestions

- A reminder that `state.population` is not initialized in the initial creation
of the `state` object.

### PopBarChart

- A reminder that `state.population` is not initialized in the initial creation
of the `state` object.
- Another reminder that svg can be modified by css, if global formatting is needed.
- Consts, hard-coded display settings, are defined as global variables, which could
live in utils as an object.

### Routes

- In `savePlanToDB`, the `state` argument
is serialized and in the request body,
it is stringified and parsed. I might be
wrong, but this seems to turn an object
into a string and back into an object
again. What is the advantage of this
process?
- The `serialized` variable is used in
different ways. What is the difference
between using `serialized` and the `state`
object directly?
- The `history` variable is not initialized
or used anywhere
