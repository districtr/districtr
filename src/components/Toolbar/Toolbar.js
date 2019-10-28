import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { actions } from "../../reducers/toolbar";
import { savePlanToDB } from "../../routes";
import Tabs from "../Tabs";
import OptionsContainer from "./OptionsContainer";

export default class Toolbar {
    constructor(store, editor) {
        this.tools = [];
        this.toolsById = {};
        this.menuItems = [];
        this.tabs = [];

        this.renderCallback = editor.render;

        this.render = this.render.bind(this);
        this.selectTool = this.selectTool.bind(this);
        this.addTool = this.addTool.bind(this);

        this.store = store;
    }
    get activeTool() {
        return this.toolsById[this.store.state.toolbar.activeTool];
    }
    selectTool(toolId) {
        if (this.activeTool) {
            this.activeTool.deactivate();
        }
        this.toolsById[toolId].activate();
        this.store.dispatch(actions.selectTool({ id: toolId }));
    }
    addTab(tab) {
        this.tabs.push(tab);
    }
    addTabFirst(tab) {
        this.tabs.splice(0, 0, tab);
    }
    addTool(tool) {
        if (tool.options !== undefined) {
            tool.options.renderToolbar = this.renderCallback;
        }
        this.toolsById[tool.id] = tool;
        this.tools.push(tool);
    }
    savePlan(e) {
        savePlanToDB(this.state, undefined, (_id) => {
            if (_id || (window.location.hostname === 'localhost')) {
                document.getElementById("save-popup").className = "show";
                document.getElementById("code-popup").innerText = `https://${window.location.host}/edit/${_id}`;

                let btn = e.target;
                btn.innerText = "Saved";
                btn.className = "saved";
            } else {
                console.error("Failed to save map");
            }
        });
    }
    unsave() {
        let btn = document.getElementById("desktop-upload");
        // only need to update the button if user previously saved state
        // and we now need to allow an update
        if (btn.innerText === "Saved") {
            btn.innerText = "Update";
            btn.className = "updated";
        }
    }
    setMenuItems(menuItems) {
        this.menuItems = menuItems;
    }
    setState(state) {
        this.state = state;
    }
    render() {
        const { dropdownMenuOpen } = this.store.state.toolbar;
        return html`
        <div class="toolbar">
            <nav>
                <div class="toolbar-top">
                    <div class="icon-list">
                        ${repeat(
                            this.tools,
                            tool => tool.id,
                            tool => tool.render(this.selectTool)
                        )}
                    </div>
                    <div
                        id="desktop-upload"
                        class="unsaved"
                        @click="${this.savePlan.bind(this)}"
                    >
                        Share
                    </div>
                    <div id="save-popup">
                        <button
                            class="button button--transparent button--icon media__close close-button"
                            @click="${() => {
                                document.getElementById("save-popup").className = "hide";
                            }}"
                        >
                            <i class="material-icons">
                                close
                            </i>
                        </button>

                        <strong>Uploaded Plan</strong>
                        You can share your current plan by copying this URL:
                        <code id="code-popup"></code>
                        <br/>
                        <label>Have an event code?</label>
                        <input
                            id="event-coder-popup"
                            type="text"
                            class="text-input"
                            value=""
                            @input="${() => document.getElementById("re-save-popup").disabled = false}"
                        />
                        <br/>
                        <button
                            id="re-save-popup"
                            disabled
                            @click="${() => {
                                document.getElementById("save-popup").className = "hide";
                                savePlanToDB(
                                    this.state,
                                    document.getElementById("event-coder-popup").value,
                                    () => { console.log("added event code"); }
                                );
                            }}"
                        >
                            Add to Event
                        </button>
                    </div>
                    ${DropdownMenuButton(dropdownMenuOpen, this.store.dispatch)}
                </div>
                ${DropdownMenu(this.menuItems, dropdownMenuOpen)}
            </nav>
            ${OptionsContainer(this.activeTool)}
            ${Tabs(this.tabs, this.store.state, this.store.dispatch)}
            </div>
        </div>
        `;
    }
}

function DropdownMenuButton(isOpen, dispatch) {
    const toggleDropdownMenu = isOpen
        ? () => dispatch(actions.closeDropdownMenu())
        : () => {
              requestAnimationFrame(() =>
                  window.addEventListener(
                      "click",
                      () => {
                          dispatch(actions.closeDropdownMenu());
                      },
                      { once: true }
                  )
              );
              dispatch(actions.openDropdownMenu());
          };
    return html`
        <button
            tabindex="1"
            class="button button--subtle button--icon button--no-shadow"
            @click="${toggleDropdownMenu}"
        >
            <i class="material-icons">menu</i>
        </button>
    `;
}

function DropdownMenu(options, open) {
    return html`
        <ul class="dropdown reveal ${open ? "" : "reveal--hidden "}ui-list">
            ${options.map(
                option =>
                    html`
                        <li
                            id="${option.id || ""}"
                            class="ui-list__item"
                            @click=${option.onClick}
                        >
                            ${option.name}
                        </li>
                    `
            )}
        </ul>
    `;
}
