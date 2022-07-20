import { HoverWithRadius } from "./Hover";
import { bindAll } from "../utils";

export default class Brush extends HoverWithRadius {
    constructor(layer, radius, color) {
        super(layer, radius);

        this.id = Math.random();
        this.color = color;
        this.coloring = false;
        this.county_brush = false;
        this.locked = false;
        this.changedColors = new Set();
        this.nycPlusMinus = {};

        this.listeners = {
            colorend: [],
            colorfeature: [],
            colorop: [],
            undo: [],
            redo: []
        };
        bindAll(["onMouseDown", "onMouseUp", "onClick", "onTouchStart", "prepToUndo", "undo", "redo", "clearUndo"],
            this);
        this.clearUndo();
    }
    clearUndo() {
        this.cursorUndo = 0;
        this.trackUndo = [{
            color: "test",
            initial: true,
        }];
    }
    setColor(color) {
        this.color = parseInt(color);
    }
    startErasing() {
        this._previousColor = this.color;
        this.color = null;
        this.erasing = true;
    }
    stopErasing() {
        this.color = this._previousColor;
        this.erasing = false;
    }
    hoverOn(features) {
        this.hoveredFeatures = features;

        if (this.coloring === true) {
            this.colorFeatures();
        } else {
            super.hoverOn(features);
        }
    }
    colorFeatures() {
        if (this.locked && !this.erasing) {
            this._colorFeatures(
                feature =>
                    feature.state.color === null ||
                    feature.state.color === undefined ||
                    isNaN(feature.state.color)
            );
        } else {
            this._colorFeatures(feature => feature.state.color !== this.color);
        }
    }
    _colorFeatures(filter) {
        let seenFeatures = new Set(),
            seenCounties = new Set(),
            countyProp = "GEOID10";
        if (this.color || this.color === 0 || this.color === '0') {
            this.changedColors.add(Number(this.color));
            if (!this.nycPlusMinus[String(Number(this.color))]) {
              this.nycPlusMinus[String(Number(this.color))] = { added:[], removed:[] };
            }
        }
        for (let feature of this.hoveredFeatures) {
            if (filter(feature)) {
                if (this.county_brush) {
                    let ps = feature.properties,
                        countyFIPS = null,
                        idSearch = (key, substr, fn) => {
                            if (!ps[key]) {
                                if (ps[key.toLowerCase()]) {
                                    key = key.toLowerCase();
                                } else {
                                    return;
                                }
                            }
                            if (substr) {
                                if (typeof ps[key] === 'number') {
                                  return [key, Number(String(ps[key]).substring(0, substr))];
                                } else {
                                  return [key, ps[key].substring(0, substr)];
                                }
                            } else {
                                if (!fn) {
                                    fn = x => x;
                                }
                                return [key, fn(ps[key])];
                            }
                        },
                        nameSplice = (val) => {
                            let name = val.split("-")[0].split(" ");
                            name.splice(-1);
                            return name.join(" ");
                        };
                    [countyProp, countyFIPS] = idSearch("GEOID10", 5)
                        || idSearch("GEOID", 5)
                        || idSearch("GEOID20", 5)
                        || idSearch("county_nam") // Michigan
                        || idSearch("VTD", 5)
                        || idSearch("VTDID", 5)
                        // || idSearch("CNTYVTD", 3)
                        || idSearch("Code", null, (precinct) => precinct.split(",")[0] + ",")
                        || idSearch("COUNTYFP")
                        || idSearch("COUNTYFP10")
                        || idSearch("COUNTY")
                        || idSearch("CTYNAME")
                        || idSearch("CNTYNAME")
                        || idSearch("cnty_nm")
                        || idSearch("locality")
                        || idSearch("NAME", null, nameSplice)
                        || idSearch("NAME10", null, nameSplice)
                        || idSearch("Precinct", null, (val) => {
                            // Oregon
                            let name = val.split("_");
                            name.splice(-1);
                            return name.join("_");
                        });
                    if (countyFIPS) {
                        seenCounties.add(countyFIPS);
                    }
                }

                if (!seenFeatures.has(feature.id)) {
                    seenFeatures.add(feature.id);
                    for (let listener of this.listeners.colorfeature) {
                        listener(feature, this.color);
                    }
                    if (!this.nycPlusMinus[String(Number(this.color))]) {
                      this.nycPlusMinus[String(Number(this.color))] = { added: [], removed: [] };
                    }
                    if (this.color === null || this.color === undefined) {
                      // handled in removal of old color (as if this was painting a new color over this)
                      // this.nycPlusMinus[String(Number(this.color))].removed.push(feature.properties.GEOINDEX || feature.properties.GEOID20);
                    } else if (Object.keys(feature.properties).includes("GEOINDEX")) {
                      this.nycPlusMinus[String(Number(this.color))].added.push(feature.properties.GEOINDEX);
                    }
                }

                // remember feature's initial color once per paint event
                // remember population data so it can be un-counted
                if (!this.trackUndo[this.cursorUndo][feature.id]) {
                    this.trackUndo[this.cursorUndo][feature.id] = {
                        properties: feature.properties,
                        color: String(feature.state.color)
                    };
                }
                if (feature.state.color || feature.state.color === 0 || feature.state.color === '0') {
                    this.changedColors.add(Number(feature.state.color));
                    if (!this.nycPlusMinus[String(Number(feature.state.color))]) {
                      this.nycPlusMinus[String(Number(feature.state.color))] = { added:[], removed:[] };
                    }
                    if (Object.keys(feature.properties).includes("GEOINDEX")) {
                      this.nycPlusMinus[String(Number(feature.state.color))].removed.push(feature.properties.GEOINDEX);
                    }
                }

                this.layer.setFeatureState(feature.id, {
                    ...feature.state,
                    color: this.color,
                    hover: true
                });
                feature.state.color = this.color;
            } else {
                this.layer.setFeatureState(feature.id, {
                    ...feature.state,
                    hover: true
                });
            }
        }
        if (this.county_brush && seenCounties.size > 0) {
            seenCounties.forEach(fips => {
                this.layer.setCountyState(fips, countyProp, {
                    color: this.color
                },
                filter,
                this.trackUndo[this.cursorUndo],
                this.listeners.colorfeature);
            });
            for (let listener of this.listeners.colorop) {
                listener();
            }
        }
        for (let listener of this.listeners.colorend) {
            listener();
        }
    }
    prepToUndo() {
        if (Object.keys(this.trackUndo[this.cursorUndo]).length > 1) {
            if (this.cursorUndo < this.trackUndo.length - 1) {
                this.trackUndo = this.trackUndo.slice(0, this.cursorUndo + 1);
            }

            // limit number of changes in the stack
            if (this.trackUndo.length > 19) {
                this.trackUndo = this.trackUndo.slice(1);
            }

            this.trackUndo.push({
                color: this.color
            });
            this.cursorUndo = this.trackUndo.length - 1;
        }
    }
    onClick(e) {
        this.changedColors = new Set();
        this.nycPlusMinus = {};
        this.prepToUndo();
        this.colorFeatures();
        if (!this.county_brush) {
            for (let listener of this.listeners.colorop) {
                listener(false, this.changedColors, this.nycPlusMinus);
            }
        }
    }
    onMouseDown(e) {
        e.preventDefault();
        e.originalEvent.preventDefault();
        this.coloring = true;
        this.changedColors = new Set();
        this.nycPlusMinus = {};
        window.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("touchend", this.onMouseUp);
        window.addEventListener("touchcancel", this.onMouseUp);

        // after you undo, the cursor is in the middle of the undo stack (possible to redo an action)
        // when you draw new material, it is no longer possible to redo
        this.prepToUndo();

        // add transparency to data-table to prevent strange pre-tally numbers
        if (window.nycmode) {
          document.body.className = 'nycmode';
        }
    }
    onMouseUp() {
        this.coloring = false;
        window.removeEventListener("mouseup", this.onMouseUp);
        window.removeEventListener("touchend", this.onMouseUp);
        window.removeEventListener("touchcancel", this.onMouseUp);
        if (Object.keys(this.trackUndo[this.cursorUndo]).length > 1) {
            for (let listener of this.listeners.colorop) {
                listener(false, this.changedColors, this.nycPlusMinus);
            }
        }
    }
    onTouchStart(e) {
        if (e.points && e.points.length <= 1) {
            this.onMouseDown(e);
        }
    }
    undo() {
        let listeners = this.listeners.colorfeature;
        let atomicAction = this.trackUndo[this.cursorUndo];
        let brushedColor = atomicAction.color;
        this.nycPlusMinus = {};
        if (brushedColor || brushedColor === 0 || brushedColor === '0') {
            this.changedColors.add(brushedColor * 1);
            if (!this.nycPlusMinus[String(brushedColor * 1)]) {
              this.nycPlusMinus[String(brushedColor * 1)] = { added:[], removed:[] };
            }
        }
        Object.keys(atomicAction).forEach((fid) => {
            if (fid === "color") {
                return;
            }
            // eraser color "undefined" should act like a brush set to null
            let amendColor = atomicAction[fid].color;
            if ((amendColor === 0 || amendColor === '0') || amendColor) {
                // had applied amendColor
                amendColor = Number(atomicAction[fid].color);
                if (isNaN(amendColor)) {
                    // had applied eraser
                    amendColor = null;
                }
            } else {
                // had applied eraser
                amendColor = null;
            }
            this.changedColors.add(amendColor);
            if (amendColor !== null && !this.nycPlusMinus[String(amendColor)]) {
              this.nycPlusMinus[String(amendColor)] = { added:[], removed:[] };
            }
            if (amendColor !== null) {
              // restore a color to this feature
              this.nycPlusMinus[String(amendColor)].added.push(Number(
                atomicAction[fid].properties.GEOINDEX
              ));
            }
            if (brushedColor !== null) {
              // remove the added color from this feature
              this.nycPlusMinus[String(brushedColor)].removed.push(Number(
                atomicAction[fid].properties.GEOINDEX
              ));
            }

            // change map color to original
            let featureState = this.layer.getFeatureState(fid);
            this.layer.setFeatureState(fid, {
                ...featureState,
                color: amendColor
            });

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
            listener(true, this.changedColors, this.nycPlusMinus);
        }
        this.changedColors = new Set();
        this.nycPlusMinus = {};
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
            if (!this.nycPlusMinus[String(brushedColor * 1)]) {
              this.nycPlusMinus[String(brushedColor * 1)] = { added:[], removed:[] };
            }
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
            if (!this.nycPlusMinus[String(amendColor)]) {
              this.nycPlusMinus[String(amendColor)] = { added:[], removed:[] };
            }

            if (amendColor !== null || isNaN(amendColor)) {
              // remove color from this feature
              this.nycPlusMinus[String(amendColor)].removed.push(Number(
                atomicAction[fid].properties.GEOINDEX
              ));
            }
            if (brushedColor !== null) {
              // re-add color to this feature
              this.nycPlusMinus[String(brushedColor)].added.push(Number(
                atomicAction[fid].properties.GEOINDEX
              ));
            }

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
            listener(true, this.changedColors, this.nycPlusMinus);
        }
        this.changedColors = new Set();
        this.nycPlusMinus = {};
        for (let listener of this.listeners.redo) {
            listener(this.cursorUndo >= this.trackUndo.length - 1);
        }
    }
    activate(mouseover) {
        super.activate(mouseover);
        if (mouseover) {
            return;
        }

        this.layer.map.getCanvas().classList.add("brush-tool");
        this.layer.map.dragPan.disable();
        this.layer.map.touchZoomRotate.disable();
        this.layer.map.doubleClickZoom.disable();

        this.layer.on("click", this.onClick);
        this.layer.map.on("touchstart", this.onTouchStart);
        this.layer.map.on("mousedown", this.onMouseDown);
    }

    deactivate(mouseover) {
        super.deactivate(mouseover);
        if (mouseover) {
            return;
        }

        this.hoverOff();
        this.layer.map.getCanvas().classList.remove("brush-tool");
        this.layer.map.dragPan.enable();
        this.layer.map.doubleClickZoom.enable();
        this.layer.map.touchZoomRotate.enable();

        this.layer.off("click", this.onClick);
        this.layer.map.off("touchstart", this.onMouseDown);
        this.layer.map.off("mousedown", this.onMouseDown);
    }
    on(event, listener) {
        this.listeners[event].push(listener);
    }
}
