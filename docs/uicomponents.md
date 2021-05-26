# UI and Display Components

Many different files and components come together to display and
provide user interaction for many of districtr's many tools and
datasets. 


## User Interface components
User interface components are used by both tools and charts (which include tables.)
User Interface options related to tools are rendered by each Tool's Option Class
when each `Tool` is loaded by the `Toolbar`. One example of this are the undo 
and redo buttons tied to brush functionality in `UndoRedo.js`. 

### Checkboxes 

There are two ways for checkboxes to be rendered into districtr. The first way
is direct, like the `BrushLock` and `CountyLock` in `Brush`. These two render
functions are nearly identical to the `toggle` function found in `/src/components/Toggle.js`. 

The hard coded functions create a div of class `ui-option` rendered in the Options 
Container. Inside, both the hard coded functions and the `toggle` function
produce a label tag of class `toolbar-checkbox` within which is contains a tag
input of class `.toolbar-checkbox`. Theis checkbox inbox has the following attributes...
- `id`, an optionalId provided for in `toggle`
- `type`, in this case always "checkbox" 
- `value`, which is found in the hard coded functions
- `?checked`, a `lit-html` form for setting a checked or not boolean, `checked` in
`toggle` or hard coded like `locked` in `BrushLock`
- `@change`, a `lit-html` form for tying a callback on change events, with event `e`
sent to the parameter `onChange` in the `toggle` or hard coded like the `toggle` parameter
in hard coded `BrushLock`. 
Finally, after the close of the input tag, a description is included before the label
tag closes. 

Listeners for these checkboxes can usually find these elements by label class or input ids. 

### Brush Options

More options for the brush is rendered by the `BrushTool` when constructed by
the `tool-bar.js`. When this tools is created, the integer number of problem parts
is sent it as the number of colors, as each color really represents an integer
that represents a painted district or community of interest. 

The `/src/components/Toolbar/BrushColorPicker.js` is a radio-type list of colors
rendered in the `OptionsContainer`. The default function renders a square color 
with active listeners ultimately tied back to the `BrushTool`, that calls this
function. Within this file, the default function uses helper function `addNewColorButton(...)`
that allows for adding new colors, when used with communities of interest.

_how does this really work if colors is passed in only up to the number of parts? Aha,
it's different when its coi_

The `districtr/src/components/Toolbar/BrushSlider.js` is even simpler. Also created with
`BrushTool`, it takes a default `radius`, a callback function and other options to render
inputs of both class `.slider` and `.slider value.` This callback function is always
`changeRadius(e)` foiund in `BrushToolOptions`.

### Select 

`/src/components/Select.js`...







Move all this to other file....


## Display Components

Modal is an example

In addition to user elements, under the `Toolbar` there are nested 
Tabs... doesn't use Tab.

LayerTab extends Tab.

## 
districtr/src/components/Tab.js
districtr/src/components/RevealSection.js
districtr/src/components/Parameter.js

/src/components/LayerTab.js, elsewhere?
