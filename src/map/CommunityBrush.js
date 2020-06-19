import Brush from "./Brush";
import { bindAll } from "../utils";
import { blendColors, changeColorLuminance } from "../colors";

export default class CommunityBrush extends Brush {
    constructor(layer, radius, color) {
        super(layer, radius, color);

        this.brush_type = "community";

        bindAll(["onMouseDown", "onMouseUp", "onClick", "onTouchStart", "_colorFeatures"], this);
    }
    _colorFeatures(filter) {
        let seenFeatures = new Set(),
            seenCounties = new Set();
        if (this.color || this.color === 0 || this.color === '0') {
            this.changedColors.add(Number(this.color));
        }
        for (let feature of this.hoveredFeatures) {
            if (filter(feature)) {
                let fullColors = this.layer.getAssignment(feature.id);
                if (this.color === null) {
                    fullColors = null;
                } else if (fullColors === null || fullColors === undefined) {
                    fullColors = this.color;
                } else if (typeof fullColors === 'number' && fullColors !== this.color) {
                    fullColors = [fullColors, this.color];
                } else if (Array.isArray(fullColors) && !fullColors.includes(this.color)) {
                    fullColors.push(this.color);
                }

                if (!this.trackUndo[this.cursorUndo][feature.id]) {
                    this.trackUndo[this.cursorUndo][feature.id] = {
                        properties: feature.properties,
                        color: feature.state.color
                    };
                }

                // Community of Interest flag for eraser behavior
                let useBlendColor = Array.isArray(fullColors) && (fullColors.length > 1),
                    blendColor = Array.isArray(fullColors) ? blendColors(fullColors) : fullColors;

                if (!seenFeatures.has(feature.id)) {
                    seenFeatures.add(feature.id);
                    for (let listener of this.listeners.colorfeature) {
                        listener(feature, fullColors);
                    }
                }

                if (Array.isArray(feature.state.color)) {
                    feature.state.color.forEach((color) => {
                        this.changedColors.add(Number(color));
                    });
                } else if (feature.state.color || feature.state.color === 0 || feature.state.color === '0') {
                    this.changedColors.add(Number(feature.state.color));
                }

                this.layer.setFeatureState(feature.id, {
                    ...feature.state,
                    color: fullColors,
                    useBlendColor: useBlendColor,
                    blendColor: blendColor,
                    blendHoverColor: changeColorLuminance(blendColor, -0.3)
                });
                // set color again here
                // fixes a bug where we re-paint the same district repeatedly
                // or fail to paint when fast-swiping
                feature.state.color = fullColors;
                feature.state.useBlendColor = useBlendColor;
                feature.state.blendColor = blendColor;
            }
        }
        for (let listener of this.listeners.colorend) {
            listener();
        }
    }
    undo() {
        let listeners = this.listeners.colorfeature;
        let atomicAction = this.trackUndo[this.cursorUndo];
        let brushedColor = atomicAction.color;
        if (brushedColor || brushedColor === 0 || brushedColor === '0') {
            this.changedColors.add(brushedColor * 1);
        }
        Object.keys(atomicAction).forEach((fid) => {
            if (fid === "color") {
                return;
            }
            // eraser color "undefined" should act like a brush set to null
            let amendColor = atomicAction[fid].color;
            if ((amendColor === 0 || amendColor === '0') || amendColor) {
                if (Array.isArray(amendColor)) {
                    amendColor.forEach((color) => {
                        this.changedColors.add(amendColor);
                    });
                } else {
                    amendColor = Number(atomicAction[fid].color);
                    if (isNaN(amendColor)) {
                        amendColor = null;
                    } else {
                        this.changedColors.add(amendColor);
                    }
                }
            } else {
                amendColor = null;
            }

            // change map colors
            let featureState = this.layer.getFeatureState(fid);
            let useBlendColor = Array.isArray(amendColor) && (amendColor.length > 1),
                blendColor = Array.isArray(amendColor) ? blendColors(amendColor) : amendColor;
            this.layer.setFeatureState(fid, {
                ...featureState,
                color: amendColor,
                useBlendColor: useBlendColor,
                blendColor: blendColor,
                blendHoverColor: changeColorLuminance(blendColor, -0.3)
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
        if (brushedColor || (brushedColor === 0 || brushedColor === '0')) {
            this.changedColors.add(brushedColor * 1);
        }
        let listeners = this.listeners.colorfeature;
        Object.keys(atomicAction).forEach((fid) => {
            if (fid === "color") {
                return;
            }

            // eraser color "undefined" should act like a brush set to null
            let featureColor = atomicAction[fid].color,
                finalColor = brushedColor; // only stays brushedColor for empty features
            if (brushedColor === null || brushedColor === undefined) {
                // redo erasing
                if (Array.isArray(featureColor)) {
                    featureColor.forEach((color) => {
                        this.changedColors.add(color * 1);
                    });
                } else if (featureColor || (featureColor === 0 || featureColor === '0')) {
                    this.changedColors.add(featureColor * 1);
                }
            } else if (featureColor || (featureColor === 0 || featureColor === '0')) {
                // re-apply brushedColor to existing feature
                if (Array.isArray(featureColor)) {
                    if (!featureColor.includes(brushedColor)) {
                        finalColor = featureColor.concat([brushedColor]); // added color
                    } else {
                        finalColor = featureColor; // unchanged
                    }
                } else if (featureColor !== brushedColor) {
                    // combined colors, first time blending
                    finalColor = [featureColor, brushedColor];
                }
            }

            // change map colors
            let featureState = this.layer.getFeatureState(fid);
            let useBlendColor = Array.isArray(finalColor) && (finalColor.length > 1),
                blendColor = Array.isArray(finalColor) ? blendColors(finalColor)[0] : finalColor;
            this.layer.setFeatureState(fid, {
                ...featureState,
                color: finalColor,
                useBlendColor: useBlendColor,
                blendColor: blendColor,
                blendHoverColor: changeColorLuminance(blendColor, -0.3)
            });

            // update subgroup totals (restoring old brush color)
            for (let listener of listeners) {
                listener({
                    id: fid,
                    state: { color: featureColor },
                    properties: atomicAction[fid].properties
                }, finalColor);
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
}
