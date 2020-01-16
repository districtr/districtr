import { html } from "lit-html";

export default (brush) => {
    // enable/disable the undo/redo buttons if we're at the end of the undo stack
    const brush_id = "brush_" + brush.id;
    brush.on("undo", (endOfStack) => {
        document.getElementById(`redo_${brush_id}`).disabled = false;
        if (endOfStack) {
            document.getElementById(`undo_${brush_id}`).disabled = true;
        }
    });
    brush.on("redo", (endOfStack) => {
        document.getElementById(`undo_${brush_id}`).disabled = false;
        if (endOfStack) {
            document.getElementById(`redo_${brush_id}`).disabled = true;
        }
    });
    brush.on("colorop", (undo_redo_mode) => {
        // if I add paint, I can undo it, and it's no longer possible to redo previous actions
        // let undo and redo functions handle whether their buttons are disabled
        if (!undo_redo_mode) {
            document.getElementById(`undo_${brush_id}`).disabled = false;
            document.getElementById(`redo_${brush_id}`).disabled = true;
        }
    });
    return html`
        <div class="ui-option undoredo-option">
            <legend class="ui-label ui-label--row">
                Undo / Redo
            </legend>
            <div style="text-align: center;width:100%;">
                <button
                    id="undo_${brush_id}"
                    class="button button--blank"
                    @click="${brush.undo}"
                    style="margin-right:8px"
                    disabled
                >
                    <i class="material-icons" style="color: #000;font-size:18px;">undo</i>
                </button>
                <button
                    id="redo_${brush_id}"
                    class="button button--blank"
                    @click="${brush.redo}"
                    disabled
                >
                    <i class="material-icons" style="color: #000;font-size:18px;">redo</i>
                </button>
            </div>
        </div>
    `;
}
