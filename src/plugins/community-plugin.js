import { html } from "lit-html";


export function CommunityPlugin(editor) {
    editor.toolbar.addTab(CommunityTab);
}

class CommunityTab {
    constructor() {
        this.id = "community";
        this.name = "My Community";
        this.sections = 
    }
    render() {
        return html`
        ${}
        `;
    }
}