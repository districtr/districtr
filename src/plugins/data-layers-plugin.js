import LayersTab from "../components/LayersTab";

export default function DataLayersPlugin(editor) {
    const layersTab = new LayersTab("layers", "Data Layers", editor.state);
    editor.toolbar.addTab(layersTab);
}
