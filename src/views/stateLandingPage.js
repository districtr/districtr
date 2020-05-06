import { html, render } from "lit-html";
import { listPlacesForState, getUnits } from "../components/PlacesList";
import { startNewPlan } from "../routes";


export default () => {
    var curState = document.head.id;
    document.title = curState.concat(" | Districtr");
    fetch("/assets/data/landing_pages.json")
        .then(response => response.json()).then(data => {
            var stateData = data.filter(st => st.state === curState)[0];
            
            // navi-bar
            render(navLinks(stateData.sections, stateData.modules.map(m => m.id)),
                   document.getElementById("nav-links"));
            
            // render page
            render(drawPage(stateData), document.getElementsByClassName("place__content")[0]);

            // set statewide to default
            var def = stateData.modules.filter(m => m.default)[0].id;
            var statewide = $("." + def);
            var btn = document.getElementById(def);

            // build a plan options
            listPlacesForState(stateData.state).then(places => {
                const target = document.getElementById("districting-options");
                render(districtingOptions(places), target);
                $(".places-list__item").not($("." + def)).hide();
            });

            // console.log(btn);
            btn.checked = true;
            $(".text-toggle").not(statewide).hide();
            $(".nav").not(statewide).hide();
            $(".place__name").not(statewide).hide();
            $(statewide).show();

            // config toggle buttons
            $('input[type="radio"]').click(function(){
                var inputValue = $(this).attr("value");
                var targetBox = $("." + inputValue);
                console.log(inputValue);
                
                $(".places-list__item").not(targetBox).hide();
                $(".text-toggle").not(targetBox).hide();
                $(".nav").not(targetBox).hide();
                $(".place__name").not(targetBox).hide();
                $(targetBox).show();
            });
        });
};



const navLinks = (sections, placeIds) =>
    sections.map(section => html`
        <li class="nav ${section.pages ? section.pages.reduce((l, ac) => l.concat(" ").concat(ac))
                                       : placeIds.reduce((l, ac) => l.concat(" ").concat(ac))}">
            <a href="#${section.nav.replace(/\s+/g, '-').toLowerCase()}" class="nav-links__link nav-links__link--major ">
                ${section.nav}
            </a>
        </li>
        `
    );

const drawPage = stateData => {
    console.log(stateData);
    console.log(stateData.sections.map(s => drawSection(s, stateData)));
    return html`
        ${drawTitles(stateData.modules, stateData.state)}
        ${stateData.sections.map(s => drawSection(s, stateData))}
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
            <h2>${section.name}</h2>
            <div class="place-options places-list">
                ${stateData.modules.map(m => html`<input type="radio" value="${m.id}" 
                                                         id="${m.id}" name="place-selection">
                                        <label for="${m.id}">${m.name}</label>`)}
            </div>
            <div id="districting-options"></div>
        `;
    } else if (section.type === "plans") {
        section_body = html`
            <div id="${section.nav.replace(/\s+/g, '-').toLowerCase()}" class="jump"></div>
            <h2>${section.name}</h2>
            <p>${section.disc}</p>
            <div id="plans">${plansSection(section.plans, section.pages[0])}</div>
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