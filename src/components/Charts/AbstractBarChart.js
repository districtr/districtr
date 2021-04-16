
import { html, svg } from "lit-html";

const defaultHeight = 100;
const defaultWidth = 100;
const horizontalSpace = 10;
const verticalSpace = 10;
const defaultHorizontalAxis = defaultHeight - verticalSpace;
const defaultVerticalAxis = verticalSpace;
const gap = 2;

/**
 * @desc Finds the correct font size based on the number of characters of the
 * string.
 * @param {Number} characters Number of characters in the string.
 * @returns {String} Returns a percentage reflecting the font size used in
 * labels.
 */
function fontSize(characters) {
    return "0.2em";
}

/**
 * @desc Creates an individual <rect> object and passes it back to the callee,
 * according to the passed parameters.
 * @param {Number} height Height of the bar.
 * @param {Number} width Width of the bar.
 * @param {Number} x Horizontal coordinate of the bar; is the bar's left edge.
 * @param {Number} y Vertical coordinate of the bar; is the bar's topmost edge.
 * @param {String} style CSS-type style.
 */
function bar(height, width, x, y, style) {
    return svg`
        <rect width="${defaultWidth}" height="${defaultHeight}" x="${x}" y="${y}" style="${style}">
        </rect>
    `;
}

/**
 * @desc Create a tick marker.
 * @param {Number} x x-coordinate of the tick.
 * @param {Number} y y-coordinate of the tick.
 * @param {Boolean=true} horizontal Is this is a horizontal tick to be placed on
 * the vertical axis?
 * @param {String} label Label for the tick.
 * @returns {SVGTemplateResult}
 */
function tick(x, y, horizontal=true, label="") {
    let width = horizontal ? 2 : 1/2,
        height = horizontal ? 1/2 : 2,
        adjY = horizontal ? defaultHorizontalAxis-y : y-height,
        tick = svg`<rect width=${width} height=${height} x="${x}" y="${adjY}"></rect>`,
        size = fontSize(label.length),
        ticklabel;
    
    // Construct the tick label.
    if (horizontal) {
        ticklabel = svg`
            <text x="${x-(7*horizontalSpace/8)}" y="${adjY+1}" style="font-size: ${size}">${label}</text>
        `;
    } else {
        ticklabel = svg`
            <text x="${x-horizontalSpace/3}" y="${defaultHorizontalAxis+verticalSpace/2}" style="font-size: ${size}">${label}</text>
        `;
    }
    
    return svg`${tick}${ticklabel}`;
}

/**
 * @desc Creates a horizontal axis for the chart.
 * @param {Number[]} ticks List of ticks for the horizontal axis. Ticks are
 * normalized (i.e. a tick at 0.75 is located at the 0.75*chart height).
 * @param {Number} y Vertical location of the axis.
 * @param {Number[]|String[]} labels List of labels for the horizontal axis;
 * empty by default, but if provided, must match one-to-one with ticks.
 * @returns {SVGTemplateResult}
 */
function horizontalAxis(
        ticks, { y=defaultHorizontalAxis, labels=[] }
    ) {
    // Create an axis object.
    let axis = svg`<rect width="${defaultWidth}" height="0.5" x="0" y="${y-2}"></rect>`,
        ticklocs = ticks.map(normedtickloc => (normedtickloc*defaultWidth)+horizontalSpace);
    
    // Add ticks and return.
    return svg`${axis}
        ${ticklocs.map((t, i) => {
            return tick(t, y, false, labels[i]);
        })}
    `;
}

/**
 * @desc Creates a vertical axis for the chart.
 * @param {Number[]} ticks List of ticks for the vertical axis.
 * @param {Number} x Horizontal location of the axis.
 * @param {Number[]|String[]} labels List of labels for the vertical axis;
 * empty by default, but if provided, must match one-to-one with ticks.
 * @returns {SVGTemplateResult}
 */
function verticalAxis(
        ticks, { x=defaultVerticalAxis, labels=[]}
    ) {
    // Create an axis object.
    let axis = svg`<rect width="0.5" height="${defaultHeight}" x="${x}" y="0"></rect>`,
        ticklocs = ticks.map(normedtickloc => (normedtickloc*defaultHeight));
    
    // Add ticks and return.
    return svg`${axis}
        ${ticklocs.map((t, i) => {
            return tick(x, t, true, labels[i]);
        })}
    `;
}

/**
 * @desc Creates an SVG with the desired bars at the desired heights.
 * @param {Number[]} xticks List of ticks for the horizontal axis.
 * @param {Number[]} yticks List of ticks for the vertical axis.
 * @param {Number[]} heights Heights of bars.
 * @param {object} details Detail points to be added.
 * @returns {HTMLTemplateElement} A renderable svg object.
 */
function bars(
        xticks, yticks,
        { heights: [], xlabels: [], ylabels: [], details={} }
    ) {
    return svg`
        <svg viewBox="0 0 ${defaultWidth} ${defaultHeight}" class="bar-chart">
            ${horizontalAxis(xticks, { labels: ["30%", "40%"] })}
            ${verticalAxis(yticks, { labels: ["30%", "40%"] })}
        </svg>
    `;
}

/**
 * @desc Wrapper object for a bar chart.
 * @param {Number[]} xticks List of ticks for the horizontal axis.
 * @param {Number[]} yticks List of ticks for the vertical axis.
 * @param {String} title Name of the chart.
 * @param {String[]} xlabels List of labels for the horizontal axis.
 * @param {String[]} ylabels List of labels for the vertical axis.
 * @param {heights[]} heights Heights of bars to be plotted.
 * @param {object} details Maps point names to points.
 * @returns {HTMLTemplateElement}
 */
function AbstractBarChart (
        xticks, yticks,
        {
            title= "",
            xlabels=[],
            ylabels=[],
            heights=[],
            details={}
        }
    ) {
    const args = {
        xlabels: xlabels,
        ylabels: ylabels,
        details: details,
        heights: heights
    };
    
    return html`
        ${bars(xticks, yticks, args)}
        <h3 style="text-align: center">${title}</h3>
    `;
}

export default AbstractBarChart;
