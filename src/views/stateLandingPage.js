import { html, render } from "lit-html";
import { listPlacesForState, getUnits } from "../components/PlacesList";
import { startNewPlan } from "../routes";
import { until } from "lit-html/directives/until";


export default () => {
    var curState = document.head.id;
    // document.title = curState.concat(" | Districtr");
    fetch("/assets/data/landing_pages.json")
        .then(response => response.json()).then(data => {
            var stateData = data.filter(st => st.state === curState)[0];


            document.title = curState.concat(" | Districtr");
            var def = stateData.modules.filter(m => m.default)[0];

            // navi-bar
            render(navLinks(stateData.sections, stateData.modules.map(m => m.ids)),
                   document.getElementById("nav-links"));






            listPlacesForState(stateData.state, true).then(places => {
                let districtingPlaces = places.filter(p => !p.limit && p.units.some(u => !u.limit));
                let onlyCommunityMode = districtingPlaces.length == 0;

                // render page
                render(drawPage(stateData, onlyCommunityMode), document.getElementsByClassName("place__content")[0]);

                // build a plan options
                if (!onlyCommunityMode) {
                     const target = document.getElementById("districting-options");
                     render(districtingOptions(districtingPlaces), target);
                }

                const commtarget = document.getElementById("community-options");
                render(communityOptions(places), commtarget);
                $(".places-list__item").hide();
                def.ids.map(id => $("." + id).show());

                onlyCommunityMode ? $(".communities").show() : $(".communities").hide();


                // select default place
                var btn = document.getElementById(def.id);
                if (btn) {
                    btn.checked = true;
                }

                var selected = def;
                // config toggle buttons
                $('input[name="place-selection"]:radio').click(function(){
                    var inputValue = $(this).attr("value");
                    var targetBox = $("." + inputValue);
                    selected = stateData.modules.filter(m => m.id === inputValue)[0];


                    $(".places-list__item").hide();
                    selected.ids.map(id => $("." + id).show());
                });

                $('input[name="draw-selection"]:radio').click(function(){
                    var inputValue = $(this).attr("value");
                    var cls = $(this).attr("class");
                    var targetBox = $("." + inputValue);

                    if (selected.mode) {
                        btn.click();
                    }

                    var l = $('input[name="place-selection"]:radio').length;
                    var i;
                    for (i = 0; i < l; i++) {
                        $('input[name="place-selection"]:radio')[i].className = cls;
                    }

                    $(".districts").hide();
                    $(".communities").hide();
                    $(targetBox).show();
                });

                if (window.location.search.includes("mode=coi")) {
                  $('input[value="communities"]').trigger('click');
                }

                $(document).ready(function(){
                  $(".all_about_redistricting_st")[0].href = "https://redistricting.lls.edu/states-"+ stateData.code + ".php";

                });
            });
            return stateData;
        });
};


const navLinks = (sections, placeIds) =>
    sections.map(section => section.nav ? html`
        <li class="nav ${section.pages ? section.pages.reduce((l, ac) => l.concat(" ").concat(ac))
                                       : placeIds.reduce((l, ac) => l.concat(" ").concat(ac))}">
            <a href="#${section.nav.replace(/\s+/g, '-').toLowerCase()}"
              class="nav-links__link nav-links__link--major">
                ${section.nav}
            </a>
        </li>`: html``

    ).concat([html`<li class="nav ${placeIds.reduce((l, ac) => l.concat(" ").concat(ac))}">
            <a href="/new">
                <img
                    class="nav-links__link nav-links__link--major nav-links__link--img"
                    src="/assets/usa_light_blue.png"
                    alt="Back to Map"
                  />
            </a>
        </li>
    `]);

const drawPage = (stateData, onlyCommunities) => {
    return html`

        <h1 class="headline place__name"> ${stateData.state} </h1>

        ${onlyCommunities ? html``
                          : html`<div class="place-options places-list">
                                     <input type="radio" value="districts"  id="districts" name="draw-selection" checked="checked" class="dist">
                                     <label for="districts" class="mode-selection">Draw Districts</label>
                                     <input type="radio" value="communities"  id="communities" name="draw-selection" class="comm">
                                     <label for="communities" class="mode-selection">Draw Communities</label>
                                 </div>`}



        ${stateData.sections.map(s => drawSection(s, stateData, onlyCommunities))}

        ${until(fetch("assets/about/landing/footer.html").then((r) => {if (r.status === 200) {
                                                                    return r.text();
                                                                } else {
                                                                    throw new Error(r.statusText);
                                                                }}).then(content => $.parseHTML(content)))}

    `
};

const drawTitles = (modules, st) =>
    modules.map(m => html`<h1 class="${m.id} headline place__name">
                            ${m.name === "Statewide" ? st : m.name}
                          </h1>`);

const drawSection = (section, stateData, onlyCommunities) => {
    var section_body =  html`<div id="${section.nav.replace(/\s+/g, '-').toLowerCase()}" class="jump"></div>
                             <h2>${section.name}</h2>`;
    if (section.type === "draw") {
       section_body = html`

            <div id="${section.nav.replace(/\s+/g, '-').toLowerCase()}" class="jump"></div>

            ${!onlyCommunities ? html`<h2 class="districts">Draw a plan from scratch</h2>` : html``}

            <h2 class="communities">Draw your community</h2>

            ${stateData.modules.length > 1 ? html`<div class="place-options places-list locals">
                ${stateData.modules.map(m => html`<input type="radio" value="${m.id}"
                                                     id="${m.id}" name="place-selection">
                                                  <label for="${m.id}" class="${m.mode}">${m.name}</label>`)}
            </div>` : ""}

             ${!onlyCommunities ? html`<div id="districting-options" class="districts"></div>` : html``}

            <div id="community-options" class="communities"></div>
            <p style="text-align: right;"><a href="#data">What are the building blocks?</a></p>
        `;
    } else if (section.type === "plans") {
        section_body = html`
            <div id="${section.nav.replace(/\s+/g, '-').toLowerCase()}" class="jump"></div>
            ${section.name ? html`<h2>${section.name}</h2>` : html``}
            ${section.no_header ?  html``: html `<p>Sometimes the easiest way to get started is by exploring a complete plan.
                                            Click on any of the plans below to open it in Districtr.
                                            Then feel free to start modifying it yourself!</p>`}
            <p>${section.disc}</p>
            <div id="plans">${plansSection(section.plans, section.ref)}</div>
            ${$.parseHTML(section.postscript)}
        `;
    } else if (section.type === "text") {
        section_body = html`
            <div id="${section.nav.replace(/\s+/g, '-').toLowerCase()}" class="jump"></div>
            <h2>${section.name}</h2>
            ${section.content_source ? until(fetch(section.content_source).then((r) => {
                                                                                if (r.status === 200) {
                                                                                    return r.text();
                                                                                } else if (userRequested) {
                                                                                    return "Section content could not be found at " + section.content_source;
                                                                                } else {
                                                                                    throw new Error(r.statusText);
                                                                                }}).then(content => $.parseHTML(content))) : ""}
            ${section.content ? $.parseHTML(section.content) : ""}
            ${section.subsections ? section.subsections.map(s => html`<h3>${s.name}</h3>
                                                                      ${s.content_source ? until(fetch(s.content_source).then((r) => {
                                                                                if (r.status === 200) {
                                                                                    return r.text();
                                                                                } else if (userRequested) {
                                                                                    return "Section content could not be found at " + s.content_source;
                                                                                } else {
                                                                                    throw new Error(r.statusText);
                                                                                }}).then(content => $.parseHTML(content))) : ""}
                                                                       ${s.content ? $.parseHTML(s.content) : ""}`) : ""}
        `;
    };

    var placeIds = stateData.modules.map(m => m.id);
    return html`
        <div class="text-toggle ${section.pages ? section.pages.reduce((l, ac) => l.concat(" ").concat(ac))
                                                : placeIds.reduce((l, ac) => l.concat(" ").concat(ac))}">
                ${section_body}
        </div>
    `
};

const plansSection = (plans, place) =>
    plans.map(
        ({ title, plans }) => html`
            <section class="place__section">
                <h3>${title}</h3>
                ${loadablePlans(plans, place)}
            </section>
        `
    );

const loadablePlans = (plans, place) =>
    html`
        <ul class="plan-thumbs">
            ${plans.map(p => loadablePlan(p, place))}
        </ul>
    `;

const numberList = numbers => html`
    <dl class="number-list">
        ${numbers.map(
            ({ number, caption }) => html`
                <div class="number-list__row">
                    <dt class="number-list__number">${number}</dt>
                    <dd class="number-list__caption">${caption}</dd>
                </div>
            `
        )}
    </dl>
`;

const loadablePlan = (plan, place) => html`
    <a href="/${place}/${plan.id}">
        <li class="plan-thumbs__thumb">
            <img
                class="thumb__img"
                src="/assets/${place}-plans/${plan.id}.png"
                alt="Districting Plan ${plan.id}"
            />
            <figcaption class="thumb__caption">
                <h6 class="thumb__heading">${plan.name || plan.id}</h6>
                ${plan.description ? plan.description : ""}
                ${plan.numbers ? numberList(plan.numbers) : ""}
            </figcaption>
        </li>
    </a>
`;

const districtingOptions = places =>
    html`
        <ul class="places-list places-list--columns">
            ${placeItemsTemplate(places, startNewPlan)}
        </ul>
    `;

const communityOptions = places =>
    html`
        <ul class="places-list places-list--columns">
            ${placeItemsTemplateCommunities(places, startNewPlan)}

        </ul>
    `;

const placeItemsTemplateCommunities = (places, onClick) =>
    places.map(place => {
        var problem = { type: "community", numberOfParts: 50, pluralNoun: "Community" };
        return getUnits(place, problem, true).map(
            units => html`
            <li class="${place.id} places-list__item places-list__item--small"
                @click="${() => onClick(place, problem, units)}">
                <div class="place-name">${place.name}</div>
                ${problemTypeInfo[problem.type] || ""}
                <div class="place-info">
                    Built out of ${units.name.toLowerCase()}
                </div>
            </li>
            `)
    }).reduce((items, item) => [...items, ...item], []);

function getProblems(place) {
    let districtingProblems = [],
        seenIds = new Set();
    place.districtingProblems.forEach((problem) => {
        let problemID = problem.name + problem.pluralNoun;
        if (seenIds.has(problemID)) {
            districtingProblems[districtingProblems.length - 1].partCounts.push(
                problem.numberOfParts
            );
        } else {
            seenIds.add(problemID);
            problem.partCounts = [problem.numberOfParts];
            districtingProblems.push(problem);
        }
    });
    return districtingProblems;
}

const problemTypeInfo = {
    multimember: html`
        <div class="place-info">
            Multi-member districts of varying sizes
        </div>
    `,
    community: html`
        <div class="place-info">Identify a community</div>
    `
};

const placeItemsTemplate = (places, onClick) =>
    places.map(place =>
        place.districtingProblems
        .sort((a, b) => a.numberOfParts - b.numberOfParts)
        .map(problem =>
            getUnits(place, problem).map(
                units => html`
                    <li
                        class="${place.id} places-list__item places-list__item--small"
                        @click="${() => onClick(place, problem, units)}"
                    >
                        <div class="place-name">
                            ${place.name}
                        </div>
                        ${problemTypeInfo[problem.type] || ""}
                        <div class="place-info">
                            ${problem.numberOfParts} ${problem.pluralNoun}
                        </div>
                        <div class="place-info">
                            Built out of ${units.name.toLowerCase()}
                        </div>
                    </li>
                `
            )
        ))
        .reduce((items, item) => [...items, ...item], []);
