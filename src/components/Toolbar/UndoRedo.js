import { html } from "lit-html";

export default (undo, redo) => html`
    <div class="ui-option">
        <legend class="ui-label ui-label--row">
            Undo / Redo
        </legend>
        <div class="slider-container">
            <button
                class="button undo-redo"
                @click="${undo}"
                style="margin-right:8px"
            >
                <i class="material-icons" style="color: #000;font-size:16px;">undo</i>
                Undo
            </button>
            <button
                class="button button--green"
                @click="${redo}"
            >
                <i class="material-icons" style="color: #000;font-size:16px;">redo</i>
                Redo
            </button>
        </div>
    </div>
`;
