import { html } from "lit-html";

export default (radius, onChange, options) => {
  let r = radius,
      makeChange = (e) => {
          r = e.target.value * 1;
          document.querySelectorAll('.slider-value.brush-size, .slider.brush-size')
              .forEach((slider_label) => {
                  slider_label.value = r;
              });
          onChange(e);
      };

   return html`
    <div class="ui-option">
        <legend class="ui-label ui-label--row">
            ${(options && options.title) ? options.title : "Brush Size"}
        </legend>
        <div class="slider-container">
            <input
                class="slider brush-size"
                type="range"
                value="${radius}"
                min="1"
                max="100"
                @change=${makeChange}
            />
            <input
                class="slider-value brush-size"
                type="number"
                value="${radius}"
                min="1"
                max="100"
                @input=${makeChange}
                @change=${makeChange}
                @keyup=${makeChange}
                @click=${makeChange}
            />
        </div>
    </div>
  `;
}
