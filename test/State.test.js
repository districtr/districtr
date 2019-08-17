import { expect } from "@open-wc/testing";
// import sinon from "sinon";
import { getAssignedUnitIds } from "../src/models/lib/assign";

// const mockFeatures = [{ id: 1 }, { id: 2 }, { id: 3 }];

// function mockState() {
//     return {
//         parts: [{ visible: false }, { visible: false }],
//         units: {
//             queryRenderedFeatures: () => mockFeatures,
//             setAssignment: sinon.fake()
//         },
//         idColumn: {
//             getValue: ({ id }) => id
//         },
//         hasExpectedData: () => true,
//         update: sinon.spy(),
//         render: sinon.spy()
//     };
// }

describe("Loading an imported plan", () => {
    // it("should make all used colors visible", () => {
    //     const state = mockState();
    //     const assignment = { 1: 0, 2: 0, 3: 1 };
    //     let remainingUnitIds = [1, 2, 3];

    //     assignLoadedUnits(state, assignment, remainingUnitIds);

    //     expect(state.parts.map(part => part.visible)).to.not.include(false);
    // });
    it("should not break when some assignments are null", () => {
        const assignment = { 1: null, 2: null, 3: 1 };
        expect(getAssignedUnitIds(assignment)).to.deep.equal(["3"]);
    });
    // it("should call State.update for each unit", () => {
    //     const state = mockState();
    //     const assignment = { 1: 0, 2: 0, 3: 1 };
    //     let remainingUnitIds = [1, 2, 3];

    //     assignLoadedUnits(state, assignment, remainingUnitIds);

    //     expect(state.update.callCount).to.equal(3);

    //     assert(state.update.calledWith(mockFeatures[0], 0));
    //     assert(state.update.calledWith(mockFeatures[1], 0));
    //     assert(state.update.calledWith(mockFeatures[2], 1));
    // });
});
