
import { Tab } from "../components/Tab";
import { addCOIs } from "../layers/COI";


function CoiVisualizationPlugin(editor) {
    let state = editor.state;
    addCOIs(state, null);
}

export default CoiVisualizationPlugin;
