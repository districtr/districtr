import { expect } from "@open-wc/testing";
import { replace } from "../src/utils";

describe("replace", () => {
    it("immutably replaces an element of a list", () => {
        const list = [1, 2, 3, 4, 5, 6];
        const result = replace(list, 3, "abc");
        expect(result).to.deep.equal([1, 2, 3, "abc", 5, 6]);
        expect(result).to.not.equal(list);
    });
});
