import { html } from "lit-html";
import LayerListItem from "../components/LayerListItem";
import select from "../components/select";
import Toggle from "../components/Toggle";
import { divideOrZeroIfNaN } from "../utils";
import DemographicOverlay from "./DemographicOverlay";

// TODO: I think we could improve the architecture of whatever's
// going on with all these "Container" components...

export default class DemographicOverlayContainer {
    constructor(layers, population) {
        this.currentLayerIndex = 0;
        this.currentSubgroupIndex = 0;
        this.currentColorRuleIndex = 0;

        this.subgroups = [population, ...population.subgroups];
        this.colorRules = colorRules;

        this.layers = layers.map(
            layer =>
                new DemographicOverlay(
                    layer,
                    population,
                    this.colorRules[this.currentColorRuleIndex].rule
                )
        );

        this.visibilityToggle = new Toggle(
            "Show demographics layer",
            false,
            visible => {
                if (visible) {
                    this.show();
                } else {
                    this.hide();
                }
            }
        );

        this.changeLayer = this.changeLayer.bind(this);
        this.changeSubgroup = this.changeSubgroup.bind(this);
        this.changeColorRule = this.changeColorRule.bind(this);
        this.render = this.render.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
    }
    show() {
        this.hide();
        this.layers[this.currentLayerIndex].setOpacity(0.8);
    }
    hide() {
        this.layers.forEach(layer => layer.setOpacity(0));
    }
    changeLayer(i) {
        this.currentLayerIndex = i;
        this.show();
    }
    changeSubgroup(i) {
        this.currentSubgroupIndex = i;
        this.layers.forEach(layer => layer.setSubgroup(this.subgroups[i]));
    }
    changeColorRule(i) {
        this.currentColorRuleIndex = i;
        this.layers.forEach(layer =>
            layer.setColorRule(this.colorRules[i].rule)
        );
    }
    render() {
        return html`
            <h4>Demographics</h4>
            ${this.visibilityToggle.render()}
            ${
                LayerListItem({
                    label: "Variable",
                    element: select(
                        "subgroup",
                        this.subgroups,
                        this.changeSubgroup
                    )
                })
            }
            ${
                LayerListItem({
                    label: "Color by",
                    element: select(
                        "demographic-color-rule",
                        this.colorRules,
                        this.changeColorRule
                    )
                })
            }
            ${
                LayerListItem({
                    label: "Display as",
                    element: select(
                        "demographic-layer-type",
                        this.layers.map(layer => getLayerDescription(layer)),
                        this.changeLayer
                    )
                })
            }
        `;
    }
}

const layerDisplayNames = { circle: "Points", fill: "Polygons" };

function getLayerDescription(layer) {
    return { name: layerDisplayNames[layer.type] };
}

export function colorByCount(subgroup) {
    return [
        "rgba",
        0,
        0,
        0,
        [
            "interpolate",
            ["linear"],
            subgroup.asMapboxExpression(),
            0,
            0,
            subgroup.population.max,
            1
        ]
    ];
}

export function colorByProportion(subgroup) {
    return [
        "rgba",
        0,
        0,
        0,
        divideOrZeroIfNaN(
            subgroup.asMapboxExpression(),
            subgroup.population.asMapboxExpression()
        )
    ];
}

const colorRules = [
    { name: "Total count", rule: colorByCount },
    { name: "Proportion", rule: colorByProportion }
];
