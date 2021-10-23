
import { html, TemplateResult } from "lit-html";

/**
 * Creates a Button object which performs the action specified by ``onChange``.
 * @param {String} label Text inside the Button.
 * @param {String} hoverText Tooltip text to display when the Button is hovered over.
 * @param {function(Event)} onClick Callback which consumes an Event.
 * @param {String|Number} optionalID Optional HTML identifier.
 * @param {String} buttonClassName Optional classname for the Button; defaults to "button--alternate".
 * @param {String} labelClassName Optional classname for the Label; defaults to empty.
 * @param {Boolean} state Optional; if treated as a checkbox, is switched when the button's clicked.
 * @param {Function} onMouseOver Optional; action taken when button is moused over.
 * @param {Function} sideEffect Optional; action taken alongside `onMouseOver`.
 * @returns {TemplateResult}
 * @constructor
 */
export class Button {
    constructor(
        onClick,
        {
            label="button", hoverText="button", optionalID=null,
            buttonClassName="button--alternate", labelClassName="",
            state=false, onMouseOver=(e)=>{}, sideEffect=(e)=>{}
        }
    ) {
        // Create this object's HTML template.
        this.template = html`
            <label class="${labelClassName}"">
                <button
                    class="${buttonClassName} button--alternate"
                    title="${hoverText}"
                    type="button"
                    id="${optionalID}"
                    @click="${(e) => {
                        onClick(e);
                        sideEffect(e);
                    }}"
                    @mouseover="${(e) => onMouseOver(e)}"
                >
                    ${label}
                </button>
            </label>
        `;
        
        // Get the internal object and make it accessible to the user in the
        // event they need to modify it.
        this.entity = document.getElementById(optionalID);
        this.state = state;
        
        // Return the TemplateResult so it can be rendered to the screen.
        return this.template;
    }
    
    disable() {
        this.entity.disabled = true;
    }
}

export default Button;
