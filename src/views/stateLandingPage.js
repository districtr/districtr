import { html, render } from "lit-html";
import { listPlacesForState, getUnits } from "../components/PlacesList";
import { startNewPlan } from "../routes";


export default () => {
    var curState = document.head.id;
    // document.title = curState.concat(" | Districtr");
    fetch("/assets/data/landing_pages.json")
        .then(response => response.json()).then(data => {
            var stateData = data.filter(st => st.state === curState)[0];
            
            // navi-bar
            render(navLinks(stateData.sections, stateData.modules.map(m => m.id)),
                   document.getElementById("nav-links"));
            
            // render page
            render(drawPage(stateData), document.getElementsByClassName("place__content")[0]);

            // set statewide to default
            var locality = window.location.pathname.split("/")[2];
            var def = locality ? stateData.modules.filter(m => locality === m.name.replace(/\s+/g, '-').toLowerCase() 
                                                            || locality === m.id) : [];

            def = def.length ? def[0] : stateData.modules.filter(m => m.default)[0];
            console.log(def);

            document.title = (def.name === "Statewide") ? curState.concat(" | Districtr")
                                : def.name.concat(", ").concat(stateData.code).concat(" | Districtr");

            var currentHistoryState = (def.name === "Statewide") ? "/" + window.location.pathname.split("/")[1] 
                                                                 : "/" + window.location.pathname.split("/")[1] 
                                                                       + "/" + def.name.replace(/\s+/g, '-').toLowerCase();
            history.replaceState({}, document.title, currentHistoryState);

            var statewide = $("." + def.id);
            var btn = document.getElementById(def.id);

            // build a plan options
            listPlacesForState(stateData.state).then(places => {
                const target = document.getElementById("districting-options");
                render(districtingOptions(places), target);
                const commtarget = document.getElementById("community-options");
                render(communityOptions(places), commtarget);
                $(".places-list__item").not($("." + def.id)).hide();
            });

            btn.checked = true;
            $(".text-toggle").not(statewide).hide();
            $(".nav").not(statewide).hide();
            $(".place__name").not(statewide).hide();
            $(".districtr-about").not(statewide).hide();
            $(statewide).show();

            // config toggle buttons
            $('input[type="radio"]').click(function(){

                var inputValue = $(this).attr("value");
                var targetBox = $("." + inputValue);
                def = stateData.modules.filter(m => m.id === inputValue)[0];
                console.log(def);
                document.title = (def.name === "Statewide") ? curState.concat(" | Districtr")
                                    : def.name.concat(", ").concat(stateData.code).concat(" | Districtr");
                currentHistoryState = (def.name === "Statewide") ? "/" + window.location.pathname.split("/")[1] 
                                                                     : "/" + window.location.pathname.split("/")[1] 
                                                                           + "/" + def.name.replace(/\s+/g, '-').toLowerCase();

                history.replaceState({}, document.title, currentHistoryState);
                
                $(".places-list__item").not(targetBox).hide();
                $(".text-toggle").not(targetBox).hide();
                $(".nav").not(targetBox).hide();
                $(".place__name").not(targetBox).hide();
                $(".districtr-about").not(targetBox).hide();
                $(targetBox).show();
            });
        });
};



const navLinks = (sections, placeIds) =>
    sections.map(section => html`
        <li class="nav ${section.pages ? section.pages.reduce((l, ac) => l.concat(" ").concat(ac))
                                       : placeIds.reduce((l, ac) => l.concat(" ").concat(ac))}">
            <a href="#${section.nav.replace(/\s+/g, '-').toLowerCase()}" 
              class="nav-links__link nav-links__link--major">
                ${section.nav}
            </a>
        </li>
        `
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
        ${drawTitles(stateData.modules, stateData.state)}
        
        ${stateData.modules.length > 1 ? html`<div class="place-options places-list">
                ${stateData.modules.map(m => html`<input type="radio" value="${m.id}" 
                                                 id="${m.id}" name="place-selection">
                                          <label for="${m.id}">${m.name}</label>`)}
                </div>` : ""}

        
        ${stateData.sections.map(s => drawSection(s, stateData))}
        <h2>About Districtr</h2>
        <p><a href="/">Districtr</a>  is a free community webtool for redistricting 
        and community mapping provided by the <a href="http://www.mggg.org">
        MGGG Redistricting Lab</a> at Tufts University. 
        We welcome questions and inquiries about the tool and about our work in
        ${stateData.modules.map(m => m.name === "Statewide" ? html`<div class="districtr-about ${m.id}">
                                                                    ${stateData.state}</div>` 
                                                            : html`<div class="districtr-about ${m.id}">
                                                                    ${m.name}</div>`)}:
        <a href="mailto:contact@mggg.org">contact@mggg.org</a>
        </p>
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
            <h2>Draw a plan from scratch</h2>
            <div id="districting-options"></div>
            <h2>Draw your community</h2>
            <div id="community-options" class="communities"></div>
        `;
    } else if (section.type === "plans") {
        section_body = html`
            <div id="${section.nav.replace(/\s+/g, '-').toLowerCase()}" class="jump"></div>
            <h2>${section.name}</h2>
            <p>${section.disc}</p>
            <div id="plans">${plansSection(section.plans, section.ref)}</div>
            ${$.parseHTML(section.postscript)}
        `;
    } else if (section.type === "text") {
        section_body = html`
            <div id="${section.nav.replace(/\s+/g, '-').toLowerCase()}" class="jump"></div>
            <h2>${section.name}</h2>
            ${$.parseHTML(section.content)}
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
                <div class="place-name"> Identify a community </div>
                <div class="place-info">
                    Built out of ${units.name.toLowerCase()}
                </div>
            </li>
            `)
    }).reduce((items, item) => [...items, ...item], []);

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