
import { html, TemplateResult } from "lit-html";

/**
 * Creates a Button object which performs the action specified by ``onChange``.
 * @param {String} label Text inside the Button.
 * @param {String} hoverText Tooltip text to display when the Button is hovered
 * over.
 * @param {function(Event)} onClick Callback which consumes an Event.
 * @param {String|Number} optionalID Optional HTML identifier.
 * @param {String} classname Optional classname for the Button; defaults to
 * "button--alternate".
 * @returns {TemplateResult}
 * @constructor
 */
export class Button {
    constructor(
        onClick,
        {
            label="button", hoverText="button", optionalID=null,
            className="button--alternate"
        }
    ) {
        // Create this object's HTML template.
        this.template = html`
            <label>
                <button
                    class=${className}
                    title="${hoverText}"
                    type="button"
                    id="${optionalID}"
                    @click="${e => onClick(e)}"
                >
                    ${label}
                </button>
            </label>
        `;
        
        // Get the internal object and make it accessible to the user in the
        // event they need to modify it.
        this.entity = document.getElementById(optionalID);
        
        // Return the TemplateResult so it can be rendered to the screen.
        return this.template;
    }
    
    disable() {
        this.entity.disabled = true;
    }
}

export default Button;
