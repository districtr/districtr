import { html } from "lit-html";
import Tool from "./Tool";

export default class PanTool extends Tool {
    constructor() {
        const icon = html`<img src="/assets/in-move.png" width="27" style="height:34px" alt="Pan Map"/>`;
        super("pan", "Pan", icon);
    }
}
