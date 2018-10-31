import { html } from "lit-html";

export const republicanConcentration = [
    "let",
    "Rpct",
    [
        "/",
        ["to-number", ["get", "Pres04R"]],
        [
            "+",
            ["to-number", ["get", "Pres04R"]],
            ["to-number", ["get", "Pres04D"]]
        ]
    ],
    [
        "interpolate",
        ["linear"],
        ["var", "Rpct"],
        0,
        "#ffffff",
        0.5,
        "#f9f9f9",
        0.51,
        "#ff5d5d",
        0.6,
        "#ff0000"
    ]
];

export default class RepublicanOverlay {
    constructor(layer) {
        this.layer = layer;
        this.render = this.render.bind(this);
        this.onChange = this.onChange.bind(this);
    }
    onChange(e) {
        if (e.target.checked) {
            this.layer.setPaintProperty("fill-color", republicanConcentration);
        } else {
            this.layer.resetPaintProperty("fill-color");
        }
    }
    render() {
        return html`
<label class="toolbar-checkbox-item">
<input type="checkbox" name="republican-layer" value="republican-layer"
@input=${this.onChange}>
Show Republican hot spots
</label>
        `;
    }
}
