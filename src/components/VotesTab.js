import { html } from "lit-html";
import ElectionResults from "./Charts/ElectionResults";

export default class VotesTab {
    constructor(id, name, elections, parts) {
        this.id = id;
        this.name = name;
        this.elections = elections;
        this.parts = parts;

        this.render = this.render.bind(this);
    }
    render() {
        return html`
            <section class="toolbar-section" id="elections">
                ${
                    this.elections.map(election =>
                        ElectionResults(election, this.parts)
                    )
                }
            </section>
        `;
    }
}
