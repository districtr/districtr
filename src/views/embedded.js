import reducer from "../reducers";
import { render, html } from "lit-html";
import { MapState } from "../Map/map";
import State from "../models/State";
import ToolsPlugin from "../plugins/tools-plugin";
import { loadPlanFromURL } from "../routes";
import { client } from "../api/client";
import { generateId } from "../utils";
import UIStateStore from "../models/UIStateStore";
import MiniToolbar from "../components/Toolbar/MiniToolbar";

const plugins = [ToolsPlugin];

function getContext({ place, url, units, number, ...districtrModule }) {
    if (url) {
        return loadPlanFromURL(url);
    } else {
        const problem = {
            name: "Districts",
            pluralNoun: "Districts",
            type: "districts",
            numberOfParts: number,
            ...districtrModule
        };
        return client
            .get(`/places/${place}`)
            .then(r => r.json())
            .then(placeRecord => {
                let unitsRecord = placeRecord.units.find(
                    item => item.slug === units
                );
                return { place: placeRecord, problem, units: unitsRecord };
            });
    }
}

export class EmbeddedDistrictr {
    constructor(target, districtrModule, options) {
        this.render = this.render.bind(this);

        options = { style: "mapbox://styles/mapbox/light-v10", ...options };

        const targetElement = document.getElementById(target);
        targetElement.classList.add("districtr__embed-container");
        const mapContainer = document.createElement("div");
        const mapContainerId = generateId(8);
        mapContainer.setAttribute("id", mapContainerId);
        mapContainer.style = "height: 100%; width: 100%";
        targetElement.appendChild(mapContainer);
        this.toolbarTarget = document.createElement("div");
        targetElement.appendChild(this.toolbarTarget);

        getContext(districtrModule)
            .then(context => {
                this.mapState = new MapState(
                    mapContainerId,
                    {
                        bounds: context.units.bounds,
                        fitBoundsOptions: {
                            padding: {
                                top: 50,
                                right: 50,
                                left: 50,
                                bottom: 50
                            }
                        }
                    },
                    options.style
                );
                this.mapState.map.on("load", () => {
                    this.mapState.map.setMaxBounds(
                        this.mapState.map.getBounds()
                    );
                    this.state = new State(
                        this.mapState.map,
                        context,
                        () => null
                    );
                    this.store = new UIStateStore(reducer, {
                        toolbar: {
                            activeTab: "criteria",
                            dropdownMenuOpen: false
                        },
                        elections: {
                            activeElectionIndex: 0
                        },
                        charts: {}
                    });
                    this.toolbar = new MiniToolbar(this.store, this);

                    for (let plugin of plugins) {
                        plugin(this);
                    }

                    this.store.subscribe(this.render);
                    this.state.subscribe(this.render);
                });
            })
            .catch(e => {
                // eslint-disable-next-line no-console
                console.error(e);
                render(
                    html`
                        <h4>An error occurred.</h4>
                    `,
                    targetElement
                );
            });
    }
    get map() {
        return this.mapState.map;
    }
    render() {
        if (!this.toolbarTarget || !this.toolbar) {
            return;
        }
        render(this.toolbar.render(), this.toolbarTarget);
    }
}

window.Districtr = (target, districtrModule, options) =>
    new EmbeddedDistrictr(target, districtrModule, options);
