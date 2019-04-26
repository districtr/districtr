import { html } from "lit-html";
import { Tab } from "../components/Tab";
import { actions } from "../reducers/toolbar";

export function CommunityPlugin(editor) {
    editor.toolbar.setMenuItems([]);
    const tab = new Tab("community", "My Community", editor.store);

    tab.addSection(AboutSection);

    editor.toolbar.addTabFirst(tab);
    editor.store.dispatch(actions.changeTab({ id: "community" }));
}

function AboutSection() {
    return html`
        <section class="toolbar-section">
            <h4>About</h4>
            <input type="text" class="text-input" />
            <textarea class="text-input text-area"></textarea>
        </section>
    `;
}
