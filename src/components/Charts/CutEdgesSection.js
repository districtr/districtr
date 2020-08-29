/* eslint-disable linebreak-style */
import { html } from "lit-html";

import { actions } from "../../reducers/charts";

export default function CutEdgesSection(state, uiState, dispatch) {
  let numCutEdges = 0;

  let cutEdges = [];

  return html`
    <section class="toolbar-section">
    <div class="cut_edges_section">
      <h4>
        Number of cut edges:
      </h4>
      <span id="num-cut-edges"> ${numCutEdges} </span>
      <h4>
        Number of cut edges compared to 50,000 plans under Recom step:
      </h4>
      <div class="cut_edges_distribution_vega">
      </div>
      <span id="cut-edges"> ${cutEdges} </span>
      </div>
    </section>
  `;
}
