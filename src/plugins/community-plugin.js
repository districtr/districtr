import { PivotTable } from "../components/Charts/PivotTable";
import { Tab } from "../components/Tab";
import { actions } from "../reducers/toolbar";
import AboutSection from "../components/AboutSection";

export default function CommunityPlugin(editor) {
    const { state, mapState } = editor;

    addLocationSearch(mapState);

    const tab = new Tab("community", "Community", editor.store);
    const about = new AboutSection(editor);
    tab.addRevealSection("About Your Community", about.render);

    const evaluationTab = new Tab("population", "Population", editor.store);
    const populationPivot = PivotTable(
        "Population",
        state.population,
        state.place.name,
        state.parts
    );
    evaluationTab.addRevealSection("Population", populationPivot, {
        isOpen: true,
        activePartIndex: 0
    });
    if (state.vap) {
        const vapPivot = PivotTable(
            "Voting Age Population",
            state.vap,
            state.place.name,
            state.parts
        );
        evaluationTab.addRevealSection("Voting Age Population", vapPivot, {
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
