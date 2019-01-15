import { html } from "lit-html";
import { actions } from "../reducers/elections";
import ElectionResults from "./Charts/ElectionResults";
import select from "./select";

export default class VotesTab {
    constructor(id, name, elections, parts) {
        this.id = id;
        this.name = name;
        this.elections = elections;
        this.parts = parts;

        this.render = this.render.bind(this);
    }
    render(state, dispatch) {
        return html`
            <section class="toolbar-section" id="elections">
                ${
                    select("elections", this.elections, index =>
                        dispatch(actions.changeElection({ index }))
                    )
                }
                ${
                    ElectionResults(
                        this.elections[state.elections.activeElectionIndex],
                        this.parts
                    )
                }
            </section>
        `;
    }
}
