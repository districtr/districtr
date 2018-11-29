import { html } from "lit-html";

export default class Toggle {
    constructor(toggleText, checked, callback) {
        this.toggleText = toggleText;
        this.checked = checked;
        this.callback = callback;

        this.onChange = this.onChange.bind(this);
        this.render = this.render.bind(this);
    }
    onChange(e) {
        this.checked = e.target.checked;
        this.callback(this.checked);
    }
    render() {
        return html`
            <label class="toolbar-checkbox-item">
                <input
                    type="checkbox"
                    ?checked="${this.checked}"
                    @input="${this.onChange}"
                />
                ${this.toggleText}
            </label>
        `;
    }
}
