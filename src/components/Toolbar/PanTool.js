import { html } from "lit-html";
import Tool from "./Tool";

export default class PanTool extends Tool {
    constructor() {
        const icon = html`<i class="material-icons">pan_tool</i>`;
        super("pan", "Pan", icon);
    }
}
