# Objects Should Be Global


- Having `window.planNumbers` in `tools-plugin.js` reveals to us a
method by which we can assign global variables. It may be useful to do
this with more objects, like `State`, `Toolbar`, etc. A great candidate
is the canvas `map` contained within `MapState`.

- Encouraging global variables may also help with clarity, by reducing
the need to nest functions.

### Toolbar
- If there is only one`Toolbar` object made and maintained, couldn't it be a global variable?

- `setMenuItems(...)` is passed a copy of information from the `State` object by the plugins.
Couldn't it just render from its own reference to the single `State` object? 

### UI State Store
- Only the one, unchanging and  defined `reducer` is ever used. Does this ever need to be an
instance variable or passed around as a parameter between classes?
as a parameter between structures?

### Landmarks Class
- Properties across the whole system should be collected together elsewhere so that
configuration is easy. Can we at least save these properties at top of file with
AllCaps names?

### ColumnSet Parts
- Constant `ABBREVIATIONS` is kept by the `Subgroup` class, but abbreviations
and other utilities should be kept together in a utils file. 

### Highlight Unassigned

- Finally, that function makes references to the mapbox-gl map, which
can alternatively be called from `edtior.state.map`, `editor.mapState.map`
and is probably even `editor.map`. For clarity, there should be one way
to reach this map, which suggests that global variables might be useful.

### Event

An object model should be made for each event that stores specific links and materials rather than hard coding
different fields for many events.

### Spatial Abilities
- This special object should be made into its own file to highlight
its importance.
- A comprehensive listing of available features could also live in that new
file.

### Place Exceptions
Much of districtr's features and displays are dependent on the `place`
of the current module. As such...
- extra layers like "School Districts" can be stored as an object
- and map style, like `streets-v11`
... can be stored in `spatial_utilties`


Finally, `altcounties`, where Louisiana Parishes and Alaska Boroughs
serve as Counties, should be set by State rather than `place` because
`place` could refer to alternative datasets or local municipalities.
