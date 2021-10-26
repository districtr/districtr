
import { html } from "lit-html";
import { Tab } from "../components/Tab";
import AbstractBarChart from "../components/Charts/AbstractBarChart";

/**
 * @desc Creates a plugin which allows users to evaluate the plans they've
 * created in real time.
 * @param {Editor} editor Editor object.
 * @constructor
 */
function AnalysisPlugin(editor) {
    const tab = new Tab("analyze", "Analysis", editor.store);
    tab.addSection(
        () => AbstractBarChart(
            [0.3, 0.4], [0.3, 0.4], { title: "Partisan Bias" }
        )
    );
    
    // Do nothing for now.
    // editor.toolbar.addTab(tab);
}

export default AnalysisPlugin;
