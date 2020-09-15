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
            
            // navi-bar
            render(navLinks(stateData.sections, stateData.modules.map(m => m.ids)),
                   document.getElementById("nav-links"));
            
            // render page
            render(drawPage(stateData), document.getElementsByClassName("place__content")[0]);


            var def = stateData.modules.filter(m => m.default)[0];
            console.log(def);

            document.title = curState.concat(" | Districtr");

            var statewide = $("." + def.id);
            var btn = document.getElementById(def.id);

            // build a plan options
            listPlacesForState(stateData.state).then(places => {
                const target = document.getElementById("districting-options");
                render(districtingOptions(places), target);
                const commtarget = document.getElementById("community-options");
                render(communityOptions(places), commtarget);
                $(".places-list__item").hide();
                def.ids.map(id => $("." + id).show());
                $(".communities").hide();
            });

            if (btn) {
                btn.checked = true;
            }
            

            // config toggle buttons
            $('input[name="place-selection"]:radio').click(function(){

                var inputValue = $(this).attr("value");
                var targetBox = $("." + inputValue);
                console.log(targetBox)
                def = stateData.modules.filter(m => m.id === inputValue)[0];
                console.log(def);
                
                $(".places-list__item").hide();
                def.ids.map(id => $("." + id).show());
            });

            $('input[name="draw-selection"]:radio').click(function(){

                var inputValue = $(this).attr("value");
                var cls = $(this).attr("class");
                var targetBox = $("." + inputValue);
                console.log(targetBox);

                var l = $('input[name="place-selection"]:radio').length;
                var i;
                for (i = 0; i < l; i++) {
                    $('input[name="place-selection"]:radio')[i].className = cls;
                }

                $(".districts").hide();
                $(".communities").hide();
                $(targetBox).show();
            });
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

const drawPage = stateData => {
    return html`
        
        <h1 class="headline place__name"> ${stateData.state} </h1>

        <div class="place-options places-list">
                <input type="radio" value="districts"  id="districts" name="draw-selection" checked="checked" class="dist">
                <label for="districts" class="mode-selection">Drawing Districts</label>
                <input type="radio" value="communities"  id="communities" name="draw-selection" class="comm">
                <label for="communities" class="mode-selection">Drawing Communities</label>
        </div>

        
        ${stateData.sections.map(s => drawSection(s, stateData))}

        <h2>About Districtr</h2>
        <p><a href="/">Districtr</a>  is a free community webtool for redistricting 
        and community mapping provided by the <a href="http://www.mggg.org">
        MGGG Redistricting Lab</a> at Tufts University. 
        We welcome questions and inquiries about the tool and our work.  Reach out to us at:
        <a href="mailto:contact@mggg.org">contact@mggg.org</a>
        </p>

        <h2>Acknowledgements</h2>
        <p>Content for this page is based on redistricting training materials by Common Cause, Mexican 
        American Legal Defense and Educational Fund, and State Voices in collaboration with Arizona Coalition 
        for Change, Asian Americans Advancing Justice | AAJC, Asian Americans Advancing Justice | Los Angeles, 
        Black Voters Matter Fund, Brennan Center for Justice, Campaign Legal Center, Center for Community Change, 
        Fair Immigration Reform Movement, Center for Popular Democracy, Demos, Lawyers Committee for Civil Rights 
        Under Law, NAACP-Legal Defense Fund, NALEO Educational Fund, Pennsylvania Voice, and Southern Coalition 
        for Social Justice.</p>

    `
};

const drawTitles = (modules, st) => 
    modules.map(m => html`<h1 class="${m.id} headline place__name">
                            ${m.name === "Statewide" ? st : m.name}
                          </h1>`);

const drawSection = (section, stateData) => {
    var section_body =  html`<div id="${section.nav.replace(/\s+/g, '-').toLowerCase()}" class="jump"></div>
                             <h2>${section.name}</h2>`;
    if (section.type === "draw") {
       section_body = html`

            <div id="${section.nav.replace(/\s+/g, '-').toLowerCase()}" class="jump"></div>
            <h2 class="districts">Draw a plan from scratch</h2>
            <h2 class="communities">Draw your community</h2>

            ${stateData.modules.length > 1 ? html`<div class="place-options places-list locals">
                ${stateData.modules.map(m => html`<input type="radio" value="${m.id}" 
                                                     id="${m.id}" name="place-selection">
                                                  <label for="${m.id}">${m.name}</label>`)}
            </div>` : ""}

            <div id="districting-options" class="districts"></div>
            <div id="community-options" class="communities" style="display: none;"></div>
            <p><a href="#data">What are these units?</a></p>
        `;
    } else if (section.type === "plans") {
        section_body = html`
            <div id="${section.nav.replace(/\s+/g, '-').toLowerCase()}" class="jump"></div>
            ${section.name ? html`<h2>${section.name}</h2>` : html``}
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
                                                                                    return "No About Page exists for this project";
                                                                                } else {
                                                                                    throw new Error(r.statusText);
                                                                                }}).then(content => $.parseHTML(content))) : ""}
            ${section.content ? $.parseHTML(section.content) : ""}
            ${section.subsections ? section.subsections.map(s => html`<h3>${s.name}</h3> ${$.parseHTML(s.content)}`) : ""}
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
        return getUnits(place, problem).map( 
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