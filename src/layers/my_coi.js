import { html, render } from "lit-html";
import { toggle } from "../components/Toggle";
import Filter from "bad-words";

import Tooltip from "../map/Tooltip";
const wordfilter = new Filter();

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
