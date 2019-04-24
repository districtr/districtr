import { html } from "lit-html";

export default class LayerList {
    constructor(id, name, items) {
        this.id = id;
        this.name = name;
        this.items = items;
        this.render = this.render.bind(this);
    }
    render() {
        return html`
            <section id="layers" class="toolbar-section layer-list">
                ${this.items.map(
                    item => html`
                        <div class="layer-list__item">
                            ${item()}
                        </div>
                    `
                )}
            </section>
        `;
    }
    //             <div class="layer-list__item">
    //                 <h4>Demographics</h4>
    //                 ${this.demographicOverlays.render()}
    //             </div>
    //             ${this.vapOverlays
    //                 ? html`
    //                       <div class="layer-list__item">
    //                           <h4>Voting Age Population</h4>
    //                           ${this.vapOverlays.render()}
    //                       </div>
    //                   `
    //                 : ""}
    //             ${this.partisanOverlays
    //                 ? html`
    //                       <div class="layer-list__item">
    //                           ${this.partisanOverlays.render()}
    //                       </div>
    //                   `
    //                 : ""}
    //             ${this.landmarks
    //                 ? html`
    //                       <div class="layer-list__item">
    //                           <h4>Landmarks</h4>
    //                           ${this.landmarks()}
    //                       </div>
    //                   `
    //                 : ""}
    //         </section>
    //     `;
    // }
}
