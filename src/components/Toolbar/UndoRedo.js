import { html } from "lit-html";

export default (undo, redo) => html`
    <div class="ui-option" style="padding-top:8px">
        <legend class="ui-label ui-label--row">
            Undo / Redo
        </legend>
        <div style="text-align: center;width:100%;">
            <button
                class="button undo-redo"
                @click="${undo}"
                style="margin-right:8px"
            >
                <i class="material-icons" style="color: #000;font-size:18px;">undo</i>
            </button>
            <button
                class="button button--green"
                @click="${redo}"
            >
                <i class="material-icons" style="color: #000;font-size:18px;">redo</i>
            </button>
        </div>
    </div>
`;
