
import { html, render } from "lit-html";
import { toggle } from "../components/Toggle";
import Filter from "bad-words";
import Tooltip from "../map/Tooltip";
const wordfilter = new Filter();

/**
 * @description Filters user-generated COIs according to specified rules.
 * @param {Object[]} cois Array of COI tilesets/assignments/whatever they are.
 * @param {String} [units="vtds"] units Name of the units we're using.
 * @returns {Object[]} Filtered COIs.
 */
function filterCOIs(cois, units="vtds") {
    // Set a list of rules (anonymous functions) each COI must abide by to be
    // displayed. Cast things to Booleans for consistency.
    let rules = [
            coi => Boolean(coi.plan),
            coi => Boolean(coi.plan.assignment),
            // Removing the below constraint because then nothing shows up!
            // coi => coi.plan.units.id === "blockgroups"
        ],
        filterer = coi => {
            for (let rule of rules) if (!rule(coi)) return false;
            return true;
        };

    // If *any* of the rules fail, the COI can't be included. Otherwise, include
    // the COI.
    return cois.filter(filterer);
}

/**
 * @description For each of the COIs, get the units they cover.
 * @param {Object[]} plans List of COIs, defined as Plans.
 * @returns [Object, Array] COIs and the units they cover ; a Set containing
 * unique COI names.
 */
function summation(plans) {
    let sum = {},
        unique = new Set(),
        _identifiers = {};

    // For each of the Plans, retrieve the names of the COIs and the GEOIDs they
    // map to.
    for (let _plan of plans) {
        // TODO: this is stupid naming and should be refactored.
        let plan = _plan.plan;

        // First, get the internal IDs for each of the Parts. 
        for (let part of plan.parts){
            _identifiers[part.id] = part.name;
            unique.add(part.name);
        }

        // Next, look in the Plan's assignment and determine to which COIs each
        // unit is assigned.
        for (let [unit, coiids] of Object.entries(plan.assignment)) {
            for (let coid of coiids) {
                // First, get the name of the COI according to its identifier.
                let coiname = _identifiers[coid];

                // Then, conditionally add it to the `sum` object, pushing the
                // units belonging to the COI.
                if (sum[coiname]) sum[coiname].push(unit);
                else sum[coiname] = [unit];
            }
        }
    }

    // Return the summed object and the unique names accompanying it.
    return [sum, Array.from(unique)]
}

/**
 * @description Fetches a JSON file which maps pattern names to filepaths. Needed
 * for assigning COIs to patterns. TODO: review which patterns we should be using.
 * @returns Promise
 */
function loadPatternMapping() {
    return fetch("/assets/patterns/patterns.json").then(res => res.json());
}

/**
 * @description Loads the desired patterns.
 * @param {mapboxgl.Map} map Map object to which we're adding patterns.
 * @param {Object} patternMapping Maps pattern names to URLs.
 * @returns Promise When each of the Promises in the provided iterable have
 * resovled or rejected, returns an array of pattern names (or "transparent" if
 * the Promise couldn't be resolved).
 */
function loadPatterns(map, patternMapping) {
    // Create an array which we'll fill with Promises.
    let patternLoadingPromises = [];

    // For each pattern and its corresponding URL, attempt to load the image
    // into mapbox. Once the image is loaded, return the name of the pattern to
    // the caller as a Promise.
    for (let [pattern, url] of Object.entries(patternMapping)) {
        patternLoadingPromises.push(
            new Promise((resolve, reject) => {
                map.loadImage(url, (error, image) => {
                    // If we encounter an error, the pattern won't load.
                    if (error) reject("transparent");

                    // Otherwise, add the pattern to the map, and it's ready for
                    // assignment!
                    map.addImage(pattern, image);
                    resolve(pattern);
                });
            })
        );
    }

    return Promise.allSettled(patternLoadingPromises);
}

/**
 * @description Maps COI names to pattern names so we can easily reference later.
 * @param {[]} names COI names.
 * @param {Object} patterns Patterns we've chosen.
 * @returns Object Takes COI names to pattern names.
 */
function patternsToCOIs(names, patterns) {
    let mapping = {};
    for (let i=0; i<names.length; i++) mapping[names[i]] = Object.keys(patterns)[i];
    return mapping;
}

/**
 * @description Removes properties from `object` not specified in `included`.
 * @param {Object} object Object to have properties removed.
 * @param {Array} included Properties retained.
 * @returns Object
 */
function include(object, included) {
    return Object.fromEntries(
        Object
            .entries(object)
            .filter(([key]) => included.includes(key))
    );
}

/**
 * @description Takes the results from Promise.allSettled() and makes them into
 * an array that's easier to handle.
 * @param {Object[]} results Resolved or rejected Promise results.
 * @returns Object[]
 */
function resolvesToArray(results) {
    let values = [];
    for (let result of results) values.push(result.value);
    return Promise.resolve(values);
}

/**
 * @description Creates a style expression for the units.
 * @param {Object} units Units we're coloring.
 * @param {Object} unitMap Maps COI names to the units they cover.
 * @param {Object} patternMap Maps COI names to the patterns they're covered with.
 * @returns {Array[]} Array of expressions.
 */
export function styleExpression(units, unitMap, patternMap) {
    let expression = ["case"];

    // For each of the COI names and GEOIDs they map they map to, create a style
    // expression based on the patterns they map to.
    for (let [coi, geoids] of Object.entries(unitMap)) {
        let subexpression = [
            "in",
            ["get", "GEOID20"],
            ["literal", geoids]
        ];
        expression.push(subexpression, patternMap[coi]);
    }

    // For the remaining units, set their paint properties to "transparent".
    expression.push("transparent");
    units.setPaintProperty("fill-pattern", expression);

    return expression;
}

/**
 * @description Configures COI-related functionality in districting mode.
 * @param {State} state Holds state for the application.
 * @param {Tab} tab Tab object we're adding items to.
 * @returns {Promise} Promise which resolves to the necessary objects for visualizing COIs.
 */
export function addCOIs(state, tab) {
    let { map, coiunits, place } = state,
        localURL = "/assets/sample_module.json",
        remoteURL = `/.netlify/functions/moduleRead?module=${place.id}&state=${place.state}&page=1`,
        URL = window.location.hostname == "localhost" ? localURL : remoteURL;

    // Fetch COI data from the provided URL. Note that in order to return the
    // required data to the caller, we have to return *all* the Promises and
    // their resolutions, not just the first or last ones. This is important, as
    // we don't want to have to recalculate COI-related stuff later.
    return fetch(URL)
        .then(res => res.json())
        .then(clusters => {
            // Filter COI clusters and create a mapping from names to patterns.
            let filtered = filterCOIs(clusters),
                [ unitMap, uniqueNames ] = summation(filtered),
                expression = ["case"];

            return loadPatternMapping().then(patterns => {
                // Now that we've loaded the names of the patterns, choose the
                // right number of patterns, load the patterns we've selected,
                // and match them to COIs.
                let names = Object.keys(patterns).slice(0, uniqueNames.length),
                    chosenPatterns = include(patterns, names),
                    patternMatch = patternsToCOIs(uniqueNames, chosenPatterns);

                // Now, we want to load each of the patterns and assign them to
                // expressions.
                return loadPatterns(map, chosenPatterns)
                    .then(loadedPatterns => resolvesToArray(loadedPatterns))
                    .then(_ => {
                        // For each of the COIs, get the block groups that it
                        // covers and create a mapbox style expression assigning
                        // a pattern overlay to the units.
                        styleExpression(coiunits, unitMap, patternMatch);
                        coiunits.setOpacity(0);

                        // From here, we want to return all the necessary items
                        // for properly rendering the COIs in the tool pane. We
                        // should return the style expression, the unit mapping,
                        // the pattern mapping, and the COIs themselves.
                        return {
                            clusters: clusters,
                            unitMap: unitMap,
                            patternMatch: patternMatch,
                            units: coiunits
                        }
                    });
            });
        });
}

export function addMyCOI (state, tab) {
    const { coiunits, coiunits2, place } = state;

    // prep modal
    const target = document.getElementById("modal");
    let coiList = new Set();
    let addSelectedCOIList = () => {
        let bgShades = ["case"], preShades = ["case"];
        let shadesByIdx = [];
        let r, g, b;
        const has_str = new RegExp('[A-z]');
        let hasCOI = false,
            hasCOI2 = false;

        let partCount = -1;
        document.getElementById("coi_browse").innerHTML = "";
        coiList.forEach(cplan => {
            if (cplan.plan.units.id === "blockgroups") {
                hasCOI = true;
            } else {
                hasCOI2 = true;
            }

            cplan.plan.parts.forEach((part) => {
                partCount++;
                let matchIds = Object.keys(cplan.plan.assignment).filter(a =>
                    cplan.plan.assignment[a] === part.id
                    || (cplan.plan.assignment[a].length && cplan.plan.assignment[a].includes(part.id))
                );
                if (!matchIds.length) {
                    return;
                }
                if (cplan.plan.units.id !== "blockgroups" && !matchIds.join("").match(has_str)) {
                    // numeric ID (Iowa counties)
                    matchIds = matchIds.map(n => Number(n));
                }

                if (partCount % 20 === 0) {
                    r = 50,
                    g = 70,
                    b = 150
                }
                r += 6;
                g += 22;
                b -= 26;
                if (g > 170) {
                    g = 70;
                }
                if (b < 80) {
                    b = 150;
                }
                let shadeNames = (cplan.plan.units.id === "blockgroups") ? bgShades : preShades;
                shadeNames.push(["in", ["get", cplan.plan.idColumn.key], ["literal", matchIds]]);
                shadeNames.push(`rgba(${r},${g},${b},0.4)`);

                shadesByIdx.push([
                    cplan.plan.units.id,
                    ["in", ["get", cplan.plan.idColumn.key], ["literal", matchIds]],
                    `rgba(${r},${g},${b},0.4)`
                ]);

                let layerkey = document.createElement("label");
                layerkey.style.display = "block";

                  let ckbox = document.createElement("input");
                  ckbox.id = "vis_" + cplan.simple_id + "_" + part.id;
                  ckbox.type = "checkbox";
                  ckbox.checked = true;
                  ckbox.onchange = () => {
                      let activated = ["case"];
                      document.querySelectorAll("#coi_browse input").forEach((ckbox, idx) => {
                          if (ckbox.checked && (shadesByIdx[idx][0] === cplan.plan.units.id)) {
                              activated.push(shadesByIdx[idx][1]);
                              activated.push(shadesByIdx[idx][2]);
                          }
                      });
                      activated.push("rgba(0,0,0,0)");
                      let editLayer = (cplan.plan.units.id === "blockgroups") ? coiunits : coiunits2;
                      editLayer.setPaintProperty("fill-color", activated.length === 2 ? "rgba(0,0,0,0)" : activated);
                  };
                  layerkey.appendChild(ckbox);

                  let squareSpan = document.createElement("span");
                  squareSpan.className = "coi-squareSpan";
                  squareSpan.style.backgroundColor = `rgba(${r},${g},${b},0.7)`;
                  layerkey.appendChild(squareSpan);

                  let name = document.createElement("span");
                  name.innerText = wordfilter.clean(part.name);
                  layerkey.appendChild(name);

                document.getElementById("coi_browse").append(layerkey);

            });
        });
        bgShades.push("rgba(0,0,0,0)");
        preShades.push("rgba(0,0,0,0)");

        if (hasCOI) {
            coiunits.setPaintProperty("fill-color", bgShades);
        } else {
            coiunits.setPaintProperty("fill-color", "rgba(0,0,0,0)");
        }
        if (hasCOI2) {
            coiunits2 && coiunits2.setPaintProperty("fill-color", preShades);
        } else {
            coiunits2 && coiunits2.setPaintProperty("fill-color", "rgba(0,0,0,0)");
        }

        // close window
        document.getElementById("coi_browse").style.display = "block";
        target.style.display = "none";
    };
    render(html`<div
        class="modal-wrapper"
        @click="${e => addSelectedCOIList()}"
    >
        <div class="modal-title">
        </div>
        <div
            class="modal-content"
            @click="${e => e.stopPropagation()}"
        >
            <button
                class="button button--transparent button--icon media__close"
                @click=${e => addSelectedCOIList()}
            >
                <i class="material-icons">
                    close
                </i>
            </button>
            <input type="search"
                  placeholder="Search maps..."
                  style="font-size: 14pt;"
                  @input=${e => {
                let searched = e.target.value.trim().toLowerCase();
                document.querySelectorAll("#modal-coi-copy ul").forEach((ul) => {
                    ul.style.display = (!searched.length || ul.innerText.toLowerCase().includes(searched))
                      ? "block"
                      : "none";
                });
            }}/>
            <div id="modal-coi-copy">
            </div>
            <div style="text-align:center">
              <button
                style="margin-left:auto;margin-right:auto;padding:6px;background-color:#1b5956;color:#fff;border-radius:.5rem;padding:.375rem .75rem;font-size:1rem;margin-top:.5rem;display:inline-block;"
                @click=${e => addSelectedCOIList()}
              >
                Update COI List
              </button>
          </div>
        </div>
    </div>`, target);
    target.style.display = "none";

    const showCOImodal = () => {
        target.style.display = "block";
        let searcher = document.querySelector(".modal-content input[type='search']");
        searcher.value = "";
        searcher.dispatchEvent(new Event("input"));
    };

    let coiMinder, coiMinder2;
    tab.addSection(() => html`
        ${toggle("View contributed COIs", true, checked => {
            let opacity = checked ? 0.8 : 0;
            coiunits.setOpacity(opacity);
            coiunits2 && coiunits2.setOpacity(opacity);
            document.getElementById("coi_browse").style.display = checked ? "block" : "none";
            if (checked) {
                coiMinder.activate();
                coiMinder2 && coiMinder2.activate();
            } else {
                coiMinder.deactivate();
                coiMinder2 && coiMinder2.deactivate();
            }
        })}
        <a
          id="coi_browse_expand"
          href="#"
          style="position:relative;top:-22px;left:195px;"
          @click="${showCOImodal}"
        >
          Browse
        </a>
        <div id="coi_browse">
          Use the Browse tool to add COIs to this list
        </div>
    `);
    const modurl = (window.location.hostname === "localhost")
                ? "/assets/sample_module.json"
                : (`/.netlify/functions/moduleRead?module=${place.id}&state=${place.state}&page=1`)

    fetch(modurl).then(res => res.json()).then((cois) => {
        cois.filter(cplan => cplan.plan && cplan.plan.assignment).forEach((cplan) => {
            let ul_outer = document.createElement("div");
            let ul2 = document.createElement("ul");
            ul2.className = "contributed";
            ul2.onclick = () => {
                // toggle
                if (ul2.className.includes("selected")) {
                    // remove from active COIs
                    ul2.className = "contributed";
                    coiList.delete(cplan);
                } else {
                    // add my COIs to active COIs
                    ul2.className = "contributed selected";
                    coiList.add(cplan);
                }
            };
            ul_outer.appendChild(ul2);

            document.getElementById("modal-coi-copy").appendChild(ul_outer);

            const addLink = (myul) => {
                let link = document.createElement("h4");
                link.innerText = "COI Map #" + cplan.simple_id;
                myul.appendChild(link);

                if (cplan.planName || cplan.eventCode) {
                    link.appendChild(document.createElement("br"));
                    let subsection = document.createElement("small");
                    subsection.innerText = cplan.planName + " from #" + cplan.eventCode;
                    link.appendChild(subsection);
                }
            }; 

            addLink(ul2);


            cplan.plan.parts.forEach((part, index) => {
                let addComm = (myul) => {
                    let li = document.createElement("li");
                    let squareSpan = document.createElement("span");
                    squareSpan.className = "number-box";
                    squareSpan.innerText = (index + 1);
                    li.appendChild(squareSpan);
                    li.append(wordfilter.clean(part.name));
                    myul.appendChild(li);
                };

                // addComm(ul);
                addComm(ul2);
            });
        });

        let tooltipVisFn = (features) => {
            if (features.length === 0) {
                return null;
            }
            let feature = features[0];
            let geoid = feature.properties["GEOID10"];
            let overlapSet = new Set();
            coiList.forEach((cplan) => {
                let part = cplan.plan.assignment[geoid];
                if (typeof part === 'object') {
                    part = part[0];
                }
                if ((part || part === 0) && document.getElementById("vis_" + cplan.simple_id + "_" + part).checked) {
                    overlapSet.add(cplan.plan.parts[part].name + " - " + (cplan.plan.parts[part].description || ""));
                }
            });
            if (!overlapSet.size) {
                return null;
            }

            return features.map(
                feature => html`
                    <div class="tooltip__text tooltip__text--column">
                        ${Array.from(overlapSet).map(d => {
                            return html`<div>${d}</div>`
                        })}
                    </div>
                `
            );
        };

        coiMinder = new Tooltip(coiunits, tooltipVisFn, 0);
        coiMinder.activate();

        if (coiunits2) {
          coiMinder2 = new Tooltip(coiunits2, tooltipVisFn, 0);
          coiMinder2.activate();
        }
    });
}
