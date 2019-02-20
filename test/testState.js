import { assert, expect } from "chai";
import sinon from "sinon";
import { assignLoadedUnits } from "../src/models/lib";

const mockFeatures = [{ id: 1 }, { id: 2 }, { id: 3 }];

function mockState() {
    return {
        parts: [{ visible: false }, { visible: false }],
        units: {
            queryRenderedFeatures: () => mockFeatures,
            setAssignment: sinon.fake()
        },
        idColumn: {
            getValue: ({ id }) => id
        },
        hasExpectedData: () => true,
        update: sinon.spy()
    };
}

describe("Loading an imported plan", () => {
    it("should make all used colors visible", () => {
        const state = mockState();
        const assignment = { 1: 0, 2: 0, 3: 1 };
        let remainingUnitIds = new Set([1, 2, 3]);

        assignLoadedUnits(state, assignment, remainingUnitIds);

        expect(state.parts.map(part => part.visible)).to.not.include(false);
    });
    it("should call State.update for each unit", () => {
        const state = mockState();
        const assignment = { 1: 0, 2: 0, 3: 1 };
        let remainingUnitIds = new Set([1, 2, 3]);

        assignLoadedUnits(state, assignment, remainingUnitIds);

        expect(state.update.callCount).to.equal(3);

        assert(state.update.calledWith(mockFeatures[0], 0));
        assert(state.update.calledWith(mockFeatures[1], 0));
        assert(state.update.calledWith(mockFeatures[2], 1));
    });
});
