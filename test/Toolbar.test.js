import { assert } from "@open-wc/testing";
import sinon from "sinon";
import Toolbar from "../src/components/Toolbar/Toolbar";

describe("Toolbar", () => {
    it("can add tabs", () => {
        const state = sinon.spy();
        const editor = sinon.spy();
        const tab = sinon.spy();
        const toolbar = new Toolbar(state, editor);
        toolbar.addTab(tab);
        assert.strictEqual(toolbar.tabs.length, 1);
        assert.strictEqual(toolbar.tabs[0], tab);
    });
});
