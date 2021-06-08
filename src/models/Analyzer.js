import UIStateStore from "./UIStateStore";
import reducer from "../reducers";
import Toolbar from "../components/Toolbar/Toolbar";
import { render } from "lit-html";

export default class Analyzer {
    constructor(state, mapState, slideshow) {
        this.render = this.render.bind(this);
        this.mapState = mapState;

        this.state = state;

        let activeTab = "criteria";
        if (localStorage) {
            activeTab = localStorage.getItem("jsonload_viewstate") || activeTab;
            localStorage.removeItem("jsonload_viewstate");
        }

        this.store = new UIStateStore(reducer, {
            toolbar: { activeTab: activeTab, dropdownMenuOpen: false },
            elections: {
                activeElectionIndex: 0
            },
            charts: {}
        });

        //this.toolbar = new Toolbar(this.store, this);
        this.slideshow = slideshow;
        
        this.store.subscribe(this.render);
        this.state.subscribe(this.render);
    }
    render() {
        render(this.slideshow.render(this.store.state, this.store.dispatch)
            , document.getElementById('slideshow-area'));
    }
}
