/* eslint-disable no-return-assign */
import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { actions } from "../../reducers/toolbar";
import { savePlanToDB } from "../../routes";
import Tabs from "../Tabs";
import OptionsContainer from "./OptionsContainer";
import { renderSaveModal, renderEventModal } from "../Modal";
import { spatial_abilities } from "../../utils";

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
        let btn = e.target;
        btn.innerText = "Saving...";
        btn.className = "saved";
        btn.disabled = true;

        const saved = () => {
          let btn = e.target;
          btn.innerText = "Saved";
          btn.className = "saved";
        };

        if (spatial_abilities(this.state.place.id).portal && (window.location.href.includes("portal") || window.location.href.includes("qa-portal"))) {
            saved();
            renderSaveModal(this.state, savePlanToDB, window.location.href.includes("qa-portal"), new URLSearchParams(
                window.location.search
              ).get("draft"));
            return;
        } else if (window.location.href.includes("event")) {
            saved();
            renderEventModal(this.state, savePlanToDB, window.location.href.split("event=")[1].split("&")[0].split("#")[0]);
            return;
        }

        savePlanToDB(this.state, undefined, undefined, (_id, action) => {
            // eslint-disable-next-line no-extra-parens
            if (_id || (window.location.hostname === 'localhost')) {
                document.getElementById("save-popup").className = "show";
                document.getElementById("code-popup").innerText = `https://${window.location.host}/${action}/${_id}`;

                saved();
            } else {
                console.error("Failed to save map");
            }
        });
    }
    // eslint-disable-next-line class-methods-use-this
    unsave() {
        let btn = document.getElementById("desktop-upload");
        // only need to update the button if user previously saved state
        // and we now need to allow an update
        btn.disabled = false;
        if (btn.innerText === "Saved") {
            btn.innerText = "Update";
            btn.className = "updated";
        }
    }
    setMenuItems(menuItems) {
        this.menuItems = menuItems.filter(m => m !== null);
    }
    setState(state) {
        this.state = state;
    }
    render() {
        const { dropdownMenuOpen } = this.store.state.toolbar;
        let eventdefault = "";
        if (window.location.href.includes("event=")) {
            eventdefault = window.location.href.split("event=")[1].split("&")[0].split("#")[0];
        }
        return html`
        <div class="toolbar toolbar-animated">
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
                        Save
                    </div>
                    <div id="save-popup">
                        <button
                            class="close-button"
                            @click="${() => {
                                document.getElementById("save-popup").className = "hide";
                            }}"
                        >
                            X
                        </button>
                        <strong>Your plan has been saved!</strong>
                        You can share your current plan by copying this URL:
                        <code id="code-popup"></code>
                        <button
                            id="copy-button"
                            @click="${() => {
                                var dummy = document.createElement("textarea");
                                const link = document.getElementById("code-popup").innerHTML;
                                document.body.appendChild(dummy);
                                dummy.value = link;
                                dummy.focus();
                                dummy.select();
                                dummy.setSelectionRange(0, 99999); /* For mobile devices */
                                document.execCommand("copy");
                                document.body.removeChild(dummy);
                                document.getElementById("copy-button").innerHTML = "Copied";
                            }}"
                        > Copy </button>
                        <br/>
                        <br/>
                        <label style="float: right; cursor: pointer;">
                          <input id="is-scratch" type="checkbox"/>
                          Save as Draft
                        </label>
                        <label>Tag or Event Code</label>
                        <br/>
                        <input
                            id="event-coder-popup"
                            type="text"
                            class="text-input"
                            value="${eventdefault}"
                            @input="${() => {
                                document.getElementById("re-save-popup").disabled = false;
                            }}"
                        />
                        <div>
                          <label>Team or Plan Name</label>
                          <br/>
                          <input
                              id="event-plan-name-popup"
                              type="text"
                              class="text-input"
                              autofill="off"
                              value=""
                              // eslint-disable-next-line no-return-assign
                              @input="${() => document.getElementById("re-save-popup").disabled = false}"
                          />
                        </div>
                        <br/>
                        <button
                            id="re-save-popup"
                            disabled
                            @click="${() => {
                                document.getElementById("save-popup").className = "hide";
                                savePlanToDB(
                                    this.state,
                                    document.getElementById("event-coder-popup").value,
                                    document.getElementById("event-plan-name-popup").value,
                                    // eslint-disable-next-line brace-style
                                    () => { console.log("added event code"); }
                                );
                            }}"
                        >
                            <span style="user-select: none">Tag your map</span>
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
                            @click=${open ? option.onClick : null}
                        >
                            ${option.name}
                        </li>
                    `
            )}
        </ul>
    `;
}
