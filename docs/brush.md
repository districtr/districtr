# The Brush
The `Brush` object we use in the map is the core way we paint and erase
features on a map. It is loaded by `tools-plugin.js` and turned on and off
by the `Toolbar`. It inherits from `HoverWithRadius` and `Hover`. Its
responsibilty is to hover over a feature one at a time, or by bunch or county.
Then, it is responsible for coloring or de-coloring these features. Finally,
it must keep track of these actions so that users can undo or redo their
changes.

## The `Brush` class in `src/map/brush.js`
The `Brush` made its debut on Tues., Oct. 23, 2018, written into districtr
by [@maxhully]. The next week, on Oct. 29, erasing with the brush was
enabled. 

### Construction
A `Brush` is consturcted with a `layer`, `radius` and `color`. The `layer`
is relevant map layer the Brush acts upon, the `radius` is a parameter
useful when selecting features in batches. A brush, like in real life,
paints one `color` at a time.

> Remember: We interact with features through their physical properties.
Thus, when we assign a unit to a district, we're just coloring them in
and interpreting that as a district later. 

A listing of instnace variables are as follows...
- `this.layer` and `this.radius` are passed up to the base classes
- `this.color` saves the parameter
- `this.coloring` tells us if the brush is coloring or hovering
- `this.county_brush` tells us if we are coloring by county
- `this.locked` tells us if we can overpaint colored features
- `this.changedColors` is a set of colors whose features may have been
painted

Though not defined on construction, `this._previousColor`, `this.erasing`,
`this.cursorUndo` and `this.trackRedo` are also instance variables used later. _please define!_

Finally, each `Brush` instance keeps a collection of `this.listeners` tied to specific 
actions...
- `colorend` signals when we're done coloring 
- `colorfeature` signals when we've colored a feature
- `colorop` related to mouse actions, undoing and redoing  _colorop?_
- `undo` and `redo` signals when actions were undone or redone. 

Finally, we bind instance methods `onMouseDown`, `onMouseUp`, `onClick`, `onTouchStart`,
`prepToUndo`, `undo`, `redo` and `clearUndo` to each instance and clear the undo/redo stack
with `this.clearUndo()`.

### Coloring and Erasing 

The primary responsibility of the `Brush`, indeed, of the entire districtr system, is the
ability to select precinct or census units and collecting them together. We do this
by coloring them. A brush carries a color one at a time. Thus, after intialization,
`this.color` can be set anew by `setColor(...)`.

When erasing, calling `startErasing()` 
stores the current color in `this._previousColor`, sets `this.color`
to null and `set.erase` to true. When we're done erasing by painting features the null color, 
we can call `stopErasing()` which restores the original brush color. 
_ later, erase only one color at a time? _

Functions `colorfeatures` and the beastly `_colorfeatures` takes into account whether
we are painting by counties, whether painted features are locked and whether we are erasing.
Depending on `this.locked` we filter for allowed paintable features, either those
that are blank or simply a different color than the brush.

> Features under locked-mode can't be recolored but can still be erased. Features
under unlocked-mode can be both recolored and erased. 
 
_color type guarantees_ 
_rename colorfeatures as helper to _colorfeatures_
_separate out colorFeatures and colorCounties?_


The main action occurs in `_colorFeatures` once it is given a filter. Here,
`seenFeatures` and `seenCounties` are a vital sets that keep track of our
work. 

First, we add the brush's color to `this.changedColors` to signal that we
have made changes with this color. _which is for undoredo?_ Then, we iterate
through all filtered counties. If we happened to select counties, we color
these counties through `layer.setCountyState(fips)` using the county's fips
codes and trigger the `colorop` listeners. Finally, we trigger the `colorend` 
listeners. 

As we iterate through features, we consider whether they're eligible for painting
using the filters described above, i.e. previously colored units cannot be recolored.
An individual feature ineligble for recoloring is passed into the layer
`setFeatureState(...)` only to indicate that it was hovered upon. _the code reimplements hoverON!_ 

If an individual feature is eligible to be recolored and we're working with single or batches
of features, this feature is added to `seenFeatures` and functions listening for `colorfeature`
are triggered with the feature and the brush's color sent as parameters.

The change is then registered to the undo/redo stack, `this.trackUndo`, `brush.color` is
added to `this.changedColors`, again and finally, the color change is sent to Mapbox using
`layer.setFeatureState(...)`.

If the brush is set to paint by county, the feature's county is recorded in `seenCounties`.

### User Interaction

Just as its ultimate base class `Hover` handles user events, `Brush` must extend
this tool to include the possibility of coloring in features. Method `hoverOn(features)`
sends the features to `colorFeatures()` if the Brush is on. 

As the mouse hovers over the features, it waits for a user's click. This
triggers a new `onClick(e)` implmentation which resets `this.changedColors`, 
prepares the undo stack with `prepToUndo` and `this.colorfeatures()` which
uses the `this.hoveredFeatures` collected by `hoverOn(features)`, as outlined
by the based class. Finally, unless we're painting by county, 
functions that listen to `colorop` events are triggered. 

> Only two functions listen for the `colorop` trigger: one written in 
`tools-plugin.js` that uses `this.changedColor` and another in `UndoRedo.js`
that resets Undo/Redo functions if a user makes new edits after undoing
previous actions.

It is also possible to paint districts by dragging the mouse around. Functions
`onMouseDown(e)`, `onMouseUp()` and `touchStart(e)` handles the initialization
of `this.changedColors`, and `this.prepToUndo` and the addition and removal of
window listeners related to dragging. Most important, these functions toggle
`this.coloring` which `hoverOn` uses to determine whether to paint features that
are hovered on.





Undoing and Redoing ===============================================
-------------------

  clearUndo is the initial state. 
  this.cursorUndo is an int of 0
  this.trackUndo is an array with initial object [{color: "test",initial: true,}];
    }
    
  preptoundo happens when click or mousedown



this.trackUndo is the star of the show! 
    this.cursorUndo, 
    
    if trackUndo at cursoUndo is long 
    if cursorundo is before the last
      advance? 
            if (this.cursorUndo < this.trackUndo.length - 1) {
                this.trackUndo = this.trackUndo.slice(0, this.cursorUndo + 1);

    if bigger than 19, this trackUndo _hard coded, trackUndo is now a queue_

    push color this color
    this.cursorUndo is the trackUndo length  1 
    ========
    
    undo and redo is called by the undoredo tool. 
    
    undo
      collect listeners, this.listeners.colorfeature
      atomicAction - this.trackUndo at this.cursorUndo 
      brushed color based on atomic action
      if there is a brush color, add it to changedcolors  _Number or *1?_
      
      fpr every atomicaction __just pass object right__? 
          if fid is color, then youre done! out! return! otherwise...
          ammendcolor is the color of the fid
            check if its a real color or if its null 
            add ammend color to amendColor 
          
            set feature state of fid,  color: amendColor

            // update subgroup totals (restoring old brush color)
            for (let listener of listeners) {
                listener({
                    id: fid,
                    state: featureState,
                    properties: atomicAction[fid].properties
                }, amendColor);
            }
            featureState.color = amendColor;
        });

        this.cursorUndo = Math.max(0, this.cursorUndo - 1);

        // locally store plan state
        for (let listener of this.listeners.colorend.concat(this.listeners.colorop)) {
            listener(true, this.changedColors);
        }
        this.changedColors = new Set();
        for (let listener of this.listeners.undo) {
            listener(this.cursorUndo <= 0);
        }
    }
    
    
    
    redo() {
        // no undo stack to move into
        if (this.trackUndo.length < this.cursorUndo + 2) {
            return;
        }

        // move up in undo/redo stack
        this.cursorUndo++;
        let atomicAction = this.trackUndo[this.cursorUndo];
        let brushedColor = atomicAction.color;
        if (brushedColor || brushedColor === 0 || brushedColor === '0') {
            this.changedColors.add(brushedColor * 1);
        }
        let listeners = this.listeners.colorfeature;
        Object.keys(atomicAction).forEach((fid) => {
            if (fid === "color") {
                return;
            }

            // eraser color "undefined" should act like a brush set to null
            let amendColor = atomicAction[fid].color;
            if ((amendColor === 0 || amendColor === '0') || amendColor) {
                amendColor = Number(atomicAction[fid].color);
            } else {
                amendColor = null;
            }
            this.changedColors.add(amendColor);

            // change map colors
            this.layer.setFeatureState(fid, {
                color: brushedColor
            });

            // update subgroup totals (restoring old brush color)
            for (let listener of listeners) {
                listener({
                    id: fid,
                    state: { color: amendColor },
                    properties: atomicAction[fid].properties
                }, brushedColor);
            }
        });

        // locally store plan state
        for (let listener of this.listeners.colorend.concat(this.listeners.colorop)) {
            listener(true, this.changedColors);
        }
        this.changedColors = new Set();
        for (let listener of this.listeners.redo) {
            listener(this.cursorUndo >= this.trackUndo.length - 1);
        }
    }

  
    
    
### Activation and Deactivation

If the mouse sits upon the map, then activating and deactivating
the `Brush` is as simple as activating and deactivating the object
through its base class `Hover`. If the mouse is away from the map,
say, when it clicks on the Toolbar, certain map behaviors are toggled.

When activated...
- `brush-tool` is added to the map canvas class list
- Map properties `dragPan`, `touchZoomRotate` and `doubleClickZoom` are disabled
- `this.onClick` is bound to its layer
- `this.touchstart` and `this.mousedown` are bound to the map.

Deactivation applies the above in reverse.

Finally, an `on(event, listener)` function registers callback functions to
events in `this.listeners`. 

_no off?_

# Community Brush
