import { html } from "lit-html";
import { Tab } from "../components/Tab";
import { actions } from "../reducers/toolbar";
import { PivotTable } from "../components/Charts/PivotTable";
import select from "../components/select";
import Parameter from "../components/Parameter";
import { bindAll } from "../utils";

export default function CommunityPlugin(editor) {
    const { state } = editor;

    const tab = new Tab("community", "Community", editor.store);
    const about = new AboutSection(editor);
    tab.addRevealSection("About Your Community", about.render);

    const evaluationTab = new Tab("population", "Population", editor.store);
    const populationPivot = PivotTable(
        "Population",
        state.population,
        state.place.name,
        state.parts
    );
    evaluationTab.addRevealSection("Population", populationPivot, {
        isOpen: true,
        activePartIndex: 0
    });
    if (state.vap) {
        const vapPivot = PivotTable(
            "Voting Age Population",
            state.vap,
            state.place.name,
            state.parts
        );
        evaluationTab.addRevealSection("Voting Age Population", vapPivot, {
            isOpen: false,
            activePartIndex: 0
        });
    }

    editor.toolbar.addTabFirst(tab);
    editor.toolbar.addTab(evaluationTab);
    editor.store.dispatch(actions.changeTab({ id: "community" }));
}

class AboutSection {
    constructor({ state, render }) {
        this.part = state.parts[0];
        this.name = this.part.name || "";
        this.description = this.part.description || "";
        this.state = state;
        this.renderCallback = render;
        this.saved = false;
        bindAll(
            ["onSave", "setName", "setDescription", "render", "setPart"],
            this
        );
    }
    setPart(index) {
        if (this.state.parts[index].visible !== true) {
            return;
        }
        this.part = this.state.parts[index];
        this.name = this.part.name || "";
        console.log(this.name);
        this.description = this.part.description || "";
        this.renderCallback();
    }
    setName(name) {
        this.name = name;
        if (this.saved) {
            this.saved = false;
            this.renderCallback();
        }
    }
    setDescription(description) {
        this.description = description;
        if (this.saved) {
            this.saved = false;
            this.renderCallback();
        }
    }
    onSave() {
        this.part.updateDescription({
            name: this.name,
            description: this.description
        });
        this.saved = true;
        this.renderCallback();
    }
    render() {
        const parts = this.state.activeParts;
        return html`
            <ul class="option-list">
                <li class="option-list__item">
                    ${parts.length > 1
                        ? Parameter({
                              label: "Community:",
                              element: select("which-community", parts, i =>
                                  this.setPart(i)
                              )
                          })
                        : ""}
                </li>
            </ul>
            ${AboutSectionTemplate(this)}
        `;
    }
}

function AboutSectionTemplate({
    name,
    description,
    saved,
    onSave,
    setName,
    setDescription
}) {
    return html`
        <ul class="option-list">
            <li class="option-list__item">
                <label class="ui-label">Community Name</label>
                <input
                    type="text"
                    class="text-input"
                    .value="${name}"
                    @blur=${e => setName(e.target.value)}
                    @focus=${e => setName(e.target.value)}
                />
            </li>
            <li class="option-list__item">
                <label class="ui-label">Describe Your Community</label>
                <textarea
                    class="text-input text-area"
                    @blur=${e => setDescription(e.target.value)}
                    @focus=${e => setDescription(e.target.value)}
                >
${description}</textarea
                >
            </li>
            <li class="option-list__item">
                <button
                    ?disabled=${saved}
                    class="button button--submit button--${saved
                        ? "disabled"
                        : "alternate"} ui-label"
                    @click=${onSave}
                >
                    ${saved ? "Saved" : "Save"}
                </button>
            </li>
        </ul>
    `;
}
