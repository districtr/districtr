import { html } from "lit-html";

export default class PlacesList {
    constructor(places, choosePlace) {
        this.places = places;
        this.choosePlace = choosePlace;
    }
    render() {
        return html`
        <ul>
            ${this.places.map(
                place =>
                    html`<li><button @click=${() => this.choosePlace(place)}>${
                        place.name
                    }</button></li>`
            )}
        </ul>
        `;
    }
}
