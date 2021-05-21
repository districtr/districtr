# Working on Tooltip! The Inspect Tool

The Inspect Tool was added between Tue. Jan. 15 and Wed. Jan. 16, 2019 by
[@maxhully]. [@mapmeld] has continued maintenance of this file, with additions
by [@jenni-niels] in the realm of displaaying VRA data.

## default class `InspectTool`

As an extension of the base `Tool` class, `InspectTool` has similar construction,
activation, deactivation and rendering functions. However, it is a very
different tool than the brushes as it must display tabular data. This is reflected
in its construction.

### Construction

Known as `inspect` and `Inspect` in its ID and name, base class `Tool`
is invoked in the typical way, with an img-tag string indicating the 
location of its icon. However, its constructor has many new requirements
that stem from the `State` plan.context.
- `state.units`
- `state.columnSets`
- `state.nameColumn`
- `state.unitsRecord`
- `state.parts`

First, `this.columnSets` is mindful of both 2018 and 2019 columns and
splits out the parameter `columnSets` for its instance variable. A new
`this.activeColumnSetIndex` is also set to 0. Within the constructor, 
a new `renderTooltipContent` function is created with the objective of
passing features to the map `TooltipContent` renderer.

Instance variable `this.layer` is assigned the parameter `units`, a
new `ToolTip` is created with `units` and the `renderTootipContent`
function and is set as the instance `this.tooltip`. Finally, `this.options`
is assigned a new `InspectToolOptions` class and the`this.changeColumnSetByIndex`
function is bound to the instance. 

### Activation and Deactivation 

This tool is activated and deactivated in a similar way using its base
object `Tool`. In addition, the `inspect-tool` class is added to the 
canvas of the `map` and the `this.tooltip` is also activated. 

When deactivated, each of the three pieces above are either deactivated
or removed from the canvas class list. 

### Column Indexes

Different column sets can be loaded into the tooltip by changing `this.activeColumnSetIndex`
with the `changeColumnSetByIndex(i)` setter. All data in the active column set can be
returned by `getActiveColumnSet()`. 

}
    changeColumnSetByIndex(i) {
        this.activeColumnSetIndex = i;
    }
    get activeColumnSet() {
        return this.columnSets[this.activeColumnSetIndex];
    }
}

## The `InspectToolOptions` class 

An options class for the inspectTool can be created by passing itself into
the `InspectToolOptions` constructor. This object carries two instance
methods, `this.inspectTool` and `this.changeRadius`, a bound function.

Triggered by the UI, `changeRadius(e)` stops the event's propagation, 
retrieves the slider value and applies this to the `inspectTool.tooltip.radius`
and rerenders the Toolbar. 

Within the toolbar, the `render` function creates a div class `.ui-option`
with a legend that displays "Tooltip Data." A `Select` class UI component 
is called to render a selection of various columnSets available. Finally,
a `BrushSlider` element titled "Spotlight Size" is created to render the
UI for changing the tooltip radius. 
