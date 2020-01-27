import { PivotTable } from "../components/Charts/PivotTable";
import { Tab } from "../components/Tab";
import { actions } from "../reducers/toolbar";
import AboutSection from "../components/AboutSection";

import spanish from "../l10n/es";
const i18n = spanish.spanish;

export default function CommunityPlugin(editor) {
    const { state, mapState } = editor;

    addLocationSearch(mapState);

    const tab = new Tab("community", i18n.community.community, editor.store);
    const about = new AboutSection(editor);
    tab.addRevealSection(i18n.community.about, about.render);

    const evaluationTab = new Tab("population", i18n.editor.population.population, editor.store);
    const populationPivot = PivotTable(
        i18n.editor.population.population,
        state.population,
        state.place.name,
        state.parts
    );
    evaluationTab.addRevealSection(i18n.editor.population.population, populationPivot, {
        isOpen: true,
        activePartIndex: 0
    });
    if (state.vap) {
        const vapPivot = PivotTable(
            i18n.editor.layers.vap,
            state.vap,
            state.place.name,
            state.parts
        );
        evaluationTab.addRevealSection(i18n.editor.layers.vap, vapPivot, {
            isOpen: false,
            activePartIndex: 0
        });
    }

    editor.toolbar.addTabFirst(tab);
    editor.toolbar.addTab(evaluationTab);
    editor.store.dispatch(actions.changeTab({ id: "community" }));
}

function addLocationSearch(mapState) {
    return (
        fetch(
            "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.2.0/mapbox-gl-geocoder.min.js"
        )
            .then(r => r.text())
            // eslint-disable-next-line no-eval
            .then(eval)
            .then(() => {
                const bounds = mapState.map.getBounds();
                const bbox = [
                    bounds.getWest(),
                    bounds.getSouth(),
                    bounds.getEast(),
                    bounds.getNorth()
                ];
                // eslint-disable-next-line no-undef
                const geocoder = new MapboxGeocoder({
                    accessToken: mapState.mapboxgl.accessToken,
                    mapboxgl: mapState.mapboxgl,
                    enableEventLogging: false,
                    bbox
                });

                const container = document.createElement("div");
                container.className = "geocoder";
                mapState.map.getContainer().appendChild(container);
                container.appendChild(geocoder.onAdd(mapState.map));
            })
            .catch(e => {
                // eslint-disable-next-line no-console
                console.error("Could not load geocoder");
                // eslint-disable-next-line no-console
                console.error(e);
            })
    );
}
