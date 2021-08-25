import { html } from "lit-html";

/**
 * Component for loading an exported plan for editing.
 *
 * This does no validation or content-type checking, so there are
 * tons of potential errors that are not caught or responded to.
 */
export default class PlanUploader {
    constructor(callback) {
        this.callback = callback;
        this.render = this.render.bind(this);
        this.handleFiles = this.handleFiles.bind(this);
    }
    handleFiles(e) {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = e => this.callback(e.target.result);
        reader.readAsText(file);
    }
    render() {
        return html`
            <label class="plan-loader">
                <input type="file" @change="${this.handleFiles}" />
                <img src="/assets/upload.png?v=2" width="50px" style="margin-right:0.75rem;">
                <text>Choose File</text>
            </label>
        `;
    }
}
