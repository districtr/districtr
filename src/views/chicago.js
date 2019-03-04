import { hydratedPlacesList } from "../components/PlacesList";
import { render } from "lit-html";
import { initializeMap } from "../Map/map";
export default () => {
    const map = initializeMap("map", {
        interactive: false,
        bounds: [[-87.9401, 41.6445], [-87.5241, 42.023]],
        fitBoundsOptions: { padding: 50 }
    });
    const options = hydratedPlacesList(
        place => place.name && place.name.toLowerCase().includes("chicago")
    );
    const target = document.getElementById("districting-options");
    render(options.render(), target);
};
