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

The `districtr/src/components/Toolbar/BrushSlider.js` is even simpler. Also created with
`BrushTool`, it takes a default `radius`, a callback function and other options to render
inputs of both class `.slider` and `.slider value.` This callback function is always
`changeRadius(e)` foiund in `BrushToolOptions`.

### Select 

The `Select` Component, found in `/src/components/Select.js`, is an implementation of an html
drop-down menu. The full code is listed below. 

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

Simply, the `Select` componenet is a lit-html style function that takes `items`, operates
upon a `handler` and sets a default `selectedIndex`. Each item is assigned an index
and its name is listed as an option. On change, the `handler` function is called with
the selected value derived from event `e`. To demonstrate its typical use, we use an example
from the `ElectionResultsSection`. 

```
Select(elections,
       index => dispatch(actions.changeElection({ index })),
       uiState.elections.activeElectionIndex)
```

In this example, an object of `elections`, essentially `state.elections` ,
is passed as the list of objects. The callback is a dispatch to an `action`
related to elections and the default active index comes from `uiState`, 
which we presume is the `UIStateStore` object `editor.state`. 

### Parameter

The `Parameter` function renders a list typically related to assembling
coaltion of races. The entire code is listed below.

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

_confusing name_
_complex use_


# #
### Suggestions

- `Parameter` has a confusing name. It behaves like a "DropdownItem".
- It also has a complicated use as it can be sent anything as its 
display object.

# #

[Return to Main](../README.md)
- [Making space for the Toolbar](./toolbar.md)
- [The Tools-Plugin prevails](./toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](./tool.md)
  - [Brush and Erase Tools](./BrushEraseTools.md)
  - [Inspect Tool](./inspecttool.md)
- [Popups a la Modal](./modal.md)
- [The top-bar Menu](./topmenu.md)
- Previous: [Rendering in Action: OptionsContainer](./optionscontainer.md)
- Next: [Actions and Reducers](./actionsreducers.md)
- [A List of UI and Display Components](./uicomponents.md)
- [Tabs and Reveal Sections](./sections.md)
