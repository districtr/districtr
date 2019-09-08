import { html } from "lit-html";

export default class OptionsLogo {
    constructor() {
    }
    activate() {
    }
    deactivate() {
    }
    render() {
        let promptQuit = () => {
            let response = window.confirm("Would you like to return to the homepage?");
            if (response) {
                window.location.href = "/";
            } else {
                // do nothing
            }
        };

        return html`
            <div class="icon-list__item" title="home">
                <label>Home</label>
                <a
                  class="home-link"
                  href="#"
                  @click=${promptQuit}>
                    <img src="/assets/districtr-splash-tiny.png"/>
                </a>
            </div>
      `;
    }
}
