
import { html, svg, SVGTemplateResult } from "lit-html";


const defaultHeight = 75;
const defaultWidth = 100;
const horizontalSpace = 10;
const verticalSpace = 10;
const defaultHorizontalAxis = defaultHeight - verticalSpace;
const defaultVerticalAxis = verticalSpace;

/**
 * @desc Finds the correct font size based on the number of characters of the
 * string.
 * @param {Number} characters Number of characters in the string.
 * @returns {String} A percentage reflecting the font size used in labels.
 */
function fontSize(characters) {
    return "0.2em";
}

/**
 * Computes the correct coordinates for plotting bars.
 * @param {Number} left Unadjusted left edge of the bin.
 * @param {Number} right Unadjusted right edge of the bin.
 * @param {Number} height Unadjusted bar height.
 * @returns {Number[]} List of adjusted left and right bin edges, and adjusted
 * width and height.
 */
function computeBar(left, right, height) {
    let leftmost = left*defaultWidth + horizontalSpace,
        rightmost = right*defaultWidth + horizontalSpace,
        normedHeight = height*defaultHeight,
        normedWidth = rightmost-leftmost;
    
    return [leftmost, rightmost, normedWidth, normedHeight];
}

/**
 * @desc Creates an individual <rect> object and passes it back to the callee,
 * according to the passed parameters.
 * @param {Number} width Normalized width of the bar.
 * @param {Number} height Normalized height of the bar.
 * @param {Number} x Normalized horizontal coordinate of the bar; is the bar's
 * left edge.
 * @param {Number} y Normalized vertical coordinate of the bar; is the bar's
 * topmost edge.
 * @param {String} style CSS-type style.
 * @returns {SVGTemplateResult} Template result for the created bar.
 */
function bar(
        width, height, x, y,
        style="fill: #b445b6;"
    ) {
    return svg`
        <rect width="${width}" height="${height}" x="${x}" y="${y}" style="${style}">
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
 * @returns {SVGTemplateResult} Template result for the created tick and tick
 * label.
 */
function tick(x, y, horizontal=true, label="") {
    let width = horizontal ? 2 : 1/2,
        height = horizontal ? 1/2 : 2,
        adjX = horizontal ? x : x - 1/2*width,
        adjY = horizontal ? defaultHorizontalAxis-y : y-height,
        tick = svg`<rect width=${width} height=${height} x="${adjX}" y="${adjY}"></rect>`,
        size = fontSize(label.length),
        ticklabel;
    
    // Construct the tick label.
    if (horizontal) {
        ticklabel = svg`
            <text x="${x-(7*horizontalSpace/8)}" y="${adjY+1/2}" style="font-size: ${size}">${label}</text>
        `;
    } else {
        ticklabel = svg`
            <text x="${x-horizontalSpace/3}" y="${defaultHorizontalAxis+verticalSpace/2}" style="font-size: ${size}">${label}</text>
        `;
    }
    
    // Return the tick and the label in an SVG template.
    return svg`${tick}${ticklabel}`;
}

/**
 * @desc Creates a horizontal axis for the chart.
 * @param {Number[]} ticks List of ticks for the horizontal axis. Ticks are
 * normalized (i.e. a tick at 0.75 is located at the 0.75*chart height).
 * @param {Number} y Vertical location of the axis.
 * @param {Number[]|String[]} labels List of labels for the horizontal axis;
 * empty by default, but if provided, must match one-to-one with ticks.
 * @returns {SVGTemplateResult} SVG template for the horizontal axis.
 */
function horizontalAxis(
        ticks, { y=defaultHorizontalAxis, labels=[] }
    ) {
    // Create an axis object.
    let height = 0.5,
        axis = svg`<rect width="${defaultWidth}" height="${height}" x="0" y="${y-height}"></rect>`,
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
 * @returns {SVGTemplateResult} SVG template for the vertical axis.
 */
function verticalAxis(
        ticks, { x=defaultVerticalAxis, labels=[]}
    ) {
    // Create an axis object.
    let width = 0.5,
        axis = svg`<rect width="${width}" height="${defaultHeight}" x="${x}" y="0"></rect>`,
        ticklocs = ticks.map(normedtickloc => (normedtickloc*defaultHeight));
    
    // Add ticks and return.
    return svg`${axis}
        ${ticklocs.map((t, i) => {
            return tick(x, t, true, labels[i]);
        })}
    `;
}

/**
 * @desc Gets the template for an individual bar.
 * @param {Number[]} bin Pair of numbers representing bin edges. Is inclusive on
 * the left, exclusive on the right.
 * @param {Number} height Unadjusted bar height.
 * @returns {SVGTemplateResult} SVG template for the resulting bar.
 */
function barTemplate(bin, height) {
    let [unnormedLeft, unnormedRight] = bin,
        unnormedHeight = height,
        [l, r, w, h] = computeBar(unnormedLeft, unnormedRight, unnormedHeight);
    
    return bar(w, h, l, defaultHeight-(h+verticalSpace));
}

/**
 * @desc Gets templates for bars.
 * @param {Array[]} bins Array of tuples; left and right bin edges.
 * @param {Number[]} heights Unadjusted bar heights; length of `bins` and
 * `heights` must match.
 * @returns {SVGTemplateResult[]} Bar SVG templates.
 */
function barsTemplate(bins, heights) {
    return bins.map((bin, i) => barTemplate(bin, heights[i]));
}

/**
 * @desc Creates an SVG with the desired bars at the desired heights.
 * @param {Number[]} hticks List of ticks for the horizontal axis.
 * @param {Number[]} vticks List of ticks for the vertical axis.
 * @param {String[]} hlabels List of labels for the horizontal axis.
 * @param {String[]} vlabels List of labels for the vertical axis.
 * @param {Array[]} bins List of tuples; bin edges.
 * @param {heights[]} heights Heights of bars to be plotted.
 * @param {object} details Detail points to be added.
 * @returns {HTMLTemplateElement} SVG template for the bar.
 */
function barChartTemplate(
        hticks, vticks,
        {
            hlabels=[],
            vlabels=[],
            bins=[],
            heights=[],
            details={}
        }
    ) {
    return svg`
        <svg viewBox="0 0 ${defaultWidth} ${defaultHeight}" class="bar-chart">
            ${barsTemplate(bins, heights)}
            ${horizontalAxis(hticks, { labels: hlabels })}
            ${verticalAxis(vticks, { labels: vlabels })}
        </svg>
    `;
}

/**
 * @desc Wrapper object for a bar chart.
 * @param {Number[]} hticks List of ticks for the horizontal axis.
 * @param {Number[]} vticks List of ticks for the vertical axis.
 * @param {String} title Name of the chart.
 * @param {String[]} hlabels List of labels for the horizontal axis.
 * @param {String[]} vlabels List of labels for the vertical axis.
 * @param {Array[]} bins List of tuples; bin edges.
 * @param {heights[]} heights Heights of bars to be plotted.
 * @param {object} details Maps point names to points.
 * @param {String} description Describes what's being plotted; is placed in a
 * paragraph after the title.
 * @returns {HTMLTemplateElement}
 */
function AbstractBarChart (
        hticks, vticks,
        {
            title="",
            hlabels=[],
            vlabels=[],
            bins=[],
            heights=[],
            details={},
            description="",
        }
    ) {
    const args = {
        hlabels: hlabels,
        vlabels: vlabels,
        details: details,
        heights: heights,
        bins: bins
    };
    
    return html`
        ${barChartTemplate(hticks, vticks, args)}
        <h3 style="text-align: center">${title}</h3>
        <p class="chart--description" style="font-size: 80%">${description}</p>
    `;
}

export default AbstractBarChart;
