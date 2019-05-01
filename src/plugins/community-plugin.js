import { html } from "lit-html";
import { Tab } from "../components/Tab";
import { actions } from "../reducers/toolbar";
import SingleDistrictTable from "../components/Charts/SingleDistrictTable";
import { bindAll } from "../utils";

export default function CommunityPlugin(editor) {
    const { state } = editor;

    const tab = new Tab("community", "Community", editor.store);
    const about = new AboutSection(editor);
    tab.addRevealSection("About Your Community", about.render);

    const evaluationTab = new Tab("population", "Population", editor.store);
    evaluationTab.addRevealSection(
        "Population",
        () =>
            SingleDistrictTable(
                state.population,
                state.place.name,
                state.plan.name
            ),
        { isOpen: true }
    );
    if (state.vap) {
        evaluationTab.addRevealSection(
            "Voting Age Population",
            () =>
                SingleDistrictTable(
                    state.population,
                    state.place.name,
                    state.plan.name
                ),
            { isOpen: false }
        );
    }

    editor.toolbar.addTabFirst(tab);
    editor.toolbar.addTab(evaluationTab);
    editor.store.dispatch(actions.changeTab({ id: "community" }));
}

class AboutSection {
    constructor(editor) {
        this.name = editor.state.plan.name;
        this.description = editor.state.plan.description;
        this.state = editor.state;
        this.renderCallback = editor.render;
        this.saved = false;
        bindAll(["onSave", "setName", "setDescription", "render"], this);
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
        this.state.plan.name = this.name;
        this.state.plan.description = this.description;
        this.saved = true;
        this.renderCallback();
    }
    render() {
        return AboutSectionTemplate(this);
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
                    value="${name}"
                    @input=${e => setName(e.target.value)}
                    @blur=${e => setName(e.target.value)}
                    @focus=${e => setName(e.target.value)}
                />
            </li>
            <li class="option-list__item">
                <label class="ui-label">Describe Your Community</label>
                <textarea
                    class="text-input text-area"
                    @input=${e => setDescription(e.target.value)}
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
