import { expect } from "chai";
import { withMargins } from "../src/utils";

describe("withMargins", () => {
    it("should add margins", () => {
        expect(
            withMargins([[0, 0], [2, 1]], [0.1, 0.1, 0.1, 0.1])
        ).to.deep.equal([[-0.2, -0.1], [2.2, 1.1]]);
    });
    it("should add the margins to the right sides", () => {
        expect(withMargins([[0, 0], [1, 1]], [0, 1, 2, 3])).to.deep.equal([
            [-3, -2],
            [2, 1]
        ]);
    });
});
