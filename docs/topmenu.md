# The Top-Bar Menu
Much of the top-bar Menu is contained within the `Toolbar` and `tools-plugin.js`
files. The Menu made its debut on Mon., Nov. 12, 2018 when [@maxhully] introduced
export functionality.

## Opening and Closing

When a `UIStateStore` is created by the `Editor`, the initial state includes the
default for `dropdownMenuOpen`, which is `false`. The work of revealing and hiding
the menu is performed by `Toolbar`, when the `DropDownMenuButton` is rendered. This
button makes dispatches which ultimately report to the UI state store. 

The actual rendering and hiding of the html element is acheived when the `DropDownMenu`'s
class is update. An designation of class `.reveal-hidden` tells the Menu to hide.

## Loading Options

Remember, the `Toolbar` only creates the space for tools and functions. It is the
`tools-plugin.js` that breathe life into the space by populating the appropriate
tools. This includes responsibility for calling `toolbar.setMenuItems` and defining `getMenuItems`. 

Menu items for all cases are relatively the same, differing little except for state/problem/context-specific
links. 

- "About redistricting", navigates to state-page "why?" section using `scrollToSection` defined in `tools-plugin.js` 
- "About the data", similarly navigates to to state-page "data" section.
- "Save plan", which opens the `renderSaveModal`, visible on mobile phones
- "Districtr homepage", returns to homepage with confirmation box
- "New plan", navigates to `/new` url 
- "Print / PDF", simple print from the window
- "Export Districtr-JSON", uses `routes.exportPlanAsJSON(state)`
- "Export Plan as SHP", uses `routes.exportPlanAsSHP(state)` mindful to inlcuded `COI` in title if warranted
- "Export Plan as GeoJSON", similar as above, with `true` parameter sent to same function indicating GeoJSON
- "Export assignment as CSV", uses `routes.exportPlanAsAssignmentFile(state)`
- "Export block assignment file", uses `routes.exportPlanAsBlockAssignment(state)` if units are Block Groups
- "About import/export options", sent to `/import-export` url in new tab 

# #

### Suggestions

`Menu` does so much by itself, I think it deserve a separate file from both the `Toolbar`, `tools-plugin.js`. The
menu and its options are loaded only once and the options change little from context to context.
