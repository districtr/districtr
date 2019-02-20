import { expect } from "chai";
import { pctDeviationFromIntegerMultiple } from "../src/components/Charts/lib";

describe("population balance", () => {
    describe("pctDeviationFromIntegerMultiple", () => {
        it("should be a percentage of the total population of the target nummber of seats", () => {
            const result = pctDeviationFromIntegerMultiple(101, 10);
            const targetPop = 100;
            const expected = 101 % targetPop / targetPop;
            expect(result).to.be.closeTo(expected, 0.000001);
        });
        it("should be negative when the district population is less than one seat's worth", () => {
            const result = pctDeviationFromIntegerMultiple(5, 10);
            expect(result).to.be.lessThan(0);
        });
    });
});
