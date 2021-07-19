# UI and Display Components

<img src="../pics/ui.png" width=50%>

Many different files and components come together to display and
provide user interaction for many of districtr's many tools and
datasets. 

## User Interface components
User interface components are used by both tools and charts (which
include tables.) User Interface options related to tools are rendered by
each [Tool]'s Option Class when each [`Tool`] is loaded by the
`Toolbar`. One example of this are the undo and redo buttons tied to
brush functionality in [`UndoRedo.js`]. 

### Checkboxes 

There are two ways for checkboxes to be rendered into districtr. The
first way is direct, like the `BrushLock` and `CountyLock` in [`Brush`].
These two render functions are nearly identical to the `toggle` function
found in [`/src/components/Toggle.js`]. 

The hard coded functions create a div of class `ui-option` rendered in
the Options  Container. Inside, both the hard coded functions and the
`toggle` function produce a label tag of class `toolbar-checkbox` within
which is contains a tag input of class `.toolbar-checkbox`. This
checkbox inbox has the following attributes...
- `id`, an optional Id provided for in `toggle`
- `type`, in this case always "checkbox" 
- `value`, which is found in the hard coded functions
- `?checked`, a `lit-html` form for setting a checked-or-not boolean,
`checked` in `toggle` or hard coded like `locked` in `BrushLock`
- `@change`, a `lit-html` form for tying a callback on change events,
with event `e`sent to the parameter `onChange` in the `toggle` or hard
coded like the `toggle` parameter in hard coded `BrushLock`.

Finally, after the close of the input tag, a description is included
before the label tag closes. 

Listeners for these checkboxes can usually find these elements by label
class or input ids. 

### Brush Options

More options for the brush is rendered by the `BrushTool` when
constructed by the `toolbar.js`. When this tools is created, the integer
number of problem parts is sent it as the number of colors, as
each "color" really represents an integer that represents a painted
district or community of interest. 

The [`/src/components/Toolbar/BrushColorPicker.js`] is a radio-type list
of colors rendered in the [`OptionsContainer`]. The default function
renders a square color with active listeners ultimately tied back to the
[`BrushTool`], that calls this function. Within this file, the default
function uses helper function `addNewColorButton(...)` that, when in
"communities" mode, allows for adding new colors/parts/communities.

The [`/src/components/Toolbar/BrushSlider.js`] is even simpler.
Also created with `BrushTool`, it takes a default `radius`, a callback
function and other options to render inputs of both class `.slider` and
`.slider value.` This callback function is always `changeRadius(e)`
found in `BrushToolOptions`. Its typical purpose is to set a `brush`'s
paint radius.

### Select 

The `Select` Component, found in [`/src/components/Select.js`], is an
implementation of an html drop-down menu. The full code is listed below. 
```
import { html } from "lit-html";

export default function Select(items, handler, selectedIndex) {
    return html`
        <select @change="${e => handler(parseInt(e.target.value))}">
            ${items.map(
                (item, i) => html`
                    <option value="${i}" ?selected=${selectedIndex === i}
                        >${item.name}</option
                    >
                `
            )}
        </select>
    `;
}
```
Simply, the `Select` componenet is a lit-html style function that takes
`items`, operates upon a `handler` and sets a default `selectedIndex`.
Each item is assigned an index and its name is listed as an option. On
change, the `handler` function is called with the selected value derived
from event `e`. To demonstrate its typical use, we use an example from
the `ElectionResultsSection`. 

```
Select(elections,
       index => dispatch(actions.changeElection({ index })),
       uiState.elections.activeElectionIndex)
```
In this example, an object of `elections`, essentially
`state.elections`, is passed as the list of objects. The callback is a
dispatch to an [`action`] related to elections and the default active
index comes from `uiState`, which we presume is the [`UIStateStore`]
object `editor.state`. 

### Parameter
The `Parameter` function renders a list typically related to assembling
coaltions of races. The entire code is listed below.
```
import { html } from "lit-html";

export const Parameter = ({ label, element }) =>
    html`
        <div class="parameter">
            <label class="parameter__label ui-label ui-label--row"
                >${label}</label
            >${element}
        </div>
    `;

export default Parameter;
```
While space is made for a `label`, which is sometimes blank, the
`element` input here is usually more complicated. For instance, in 
Coalition Builder, the `element` is a complete series of html component
checkboxes and labels built from `window.coalitiongroups`. In this case,
`Parameter` is a complex, section-type list element rather than a single
selected variable.

# #

### Suggestions

- `Parameter` has a confusing name. Sometimes, it behaves like a
"DropdownItem". Other times, its has more complicateds use as it can be
sent anything as its display element.

# #

[Return to Main](../README.md)
- [Making space for the Toolbar](../03toolsplugins/toolbar.md)
  - Previous: [Tabs and Reveal Sections](../03toolsplugins/sections.md)
  - Next: [Rendering in Action: OptionsContainer](../03toolsplugins/optionscontainer.md)
  - [The top-bar Menu](../03toolsplugins/topmenu.md)
  - [Popups a la Modal](../03toolsplugins/modal.md)

- [UIStateStore](../03toolsplugins/uistatestore.md)
- [Actions and Reducers](../03toolsplugins/actionsreducers.md)

- [The Tools-Plugin prevails](../03toolsplugins/toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](../03toolsplugins/tool.md)
  - [Brush and Erase Tools](../03toolsplugins/brusherasetools.md)
  - [Inspect Tool](../03toolsplugins/inspecttool.md)

- [Plugins!](../03toolsplugins/plugins.md)
  - The Tools Plugin (See Above)
  - The Data Layers Plugin (See Chapter 06)
  - The Community Plugin (See Chapter 05)
  - The Population Balance Plugin (See Chapter 06)

[`action`]: ../03toolsplugins/actionsreducers.md
[`Tool`]: ../03toolsplugins/tool.md
[`Toolbar`]: ../03toolsplugins/toolbar.md
[`OptionsContainer`]: ../03toolsplugins/optionscontainer.md
[`BrushTool`]: ../03toolsplugins/brusherasetools.md
[`UIStateStore`]:../03toolsplugins/uistatestore.md

[`UndoRedo.js`]: ../04drawing/undoredo.md
[`Brush`]: ../04drawing/brush.md

[`/src/components/Toggle.js`]: ../../src/components/Toggle.js`
[`/src/components/Toolbar/BrushColorPicker.js`]: ../../src/components/Toolbar/BrushColorPicker.js
[`/src/components/Toolbar/BrushSlider.js`]: ../../src/components/Toolbar/BrushSlider.js
[`/src/components/Select.js`]: ../../src/components/Select.js

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA