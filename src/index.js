import { render } from "lit-html";
import { addLayers, initializeMap } from "./map";
import apiResponse from "./mockApi";
import PlacesList from "./PlacesList";
import initializeTools from "./tools";

// const API = "https://districtr.mggg.org/api";

const map = initializeMap("map");

function main() {
    // fetch(`${API}/places/`)
    return (
        new Promise(resolve => resolve(apiResponse))
            // .then(resp => {
            //     if (!resp.ok()) {
            //         throw Error("API call failed");
            //     } else {
            //         return resp.json();
            //     }
            // })
            .then(places => {
                renderInitialView(places);
            })
    );
}
function initialize(layerInfo) {
    addLayers(map, layerInfo).then(units => {
        initializeTools(units, layerInfo);
    });
}

function renderInitialView(places) {
    console.log("rendering");
    const listOfPlaces = new PlacesList(places, initialize);
    render(listOfPlaces.render(), document.getElementById("toolbar"));
}

main();
