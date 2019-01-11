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
            <div class="plan-loader">
                <h3>...or, load an exported plan here:</h3>
                <input type="file" @change="${this.handleFiles}" />
                <p>
                    You can export a plan as a <code>.json</code> file using the
                    "Export Plan" button in the editor.
                </p>
            </div>
        `;
    }
}
