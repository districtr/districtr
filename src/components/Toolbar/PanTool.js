import { html } from "lit-html";
import Tool from "./Tool";

export default class PanTool extends Tool {
    constructor() {
        const icon = html`<img src="/assets/Icons_Pan_grey.svg" alt="Pan Map"/>`;
        super("pan", "Pan", icon);
    }
}
