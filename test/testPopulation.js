import { expect } from "chai";
import { PopulationSubgroup } from "../src/models/Population";

const subgroup = () =>
    new PopulationSubgroup({
        key: "subpop",
        name: "Subgroup population",
        min: 0,
        max: 400,
        sum: 1600,
        total: new PopulationSubgroup({
            key: "pop",
            name: "Total population",
            min: 0,
            max: 500,
            sum: 3200
        })
    });

const feature = () => ({ properties: { subpop: 100, pop: 200 } });

const fixtures = { subgroup, feature };

describe("PopulationSubgroup", () => {
    it("can be rendered as a Mapbox expression", () => {
        const subgroup = fixtures.subgroup();

        expect(subgroup.asMapboxExpression()).to.deep.equal([
            "to-number",
            ["get", "subpop"]
        ]);
    });
    it("can get the corresponding value from a feature", () => {
        const subgroup = fixtures.subgroup();
        const feature = fixtures.feature();

        expect(subgroup.getValue(feature)).to.equal(100);
    });
    it("can get the subgroup's share of the total population from a feature", () => {
        const subgroup = fixtures.subgroup();
        const feature = fixtures.feature();

        expect(subgroup.getFraction(feature)).to.be.closeTo(0.5, 0.0000001);
    });
    it("has a `sum` attribute", () => {
        const subgroup = fixtures.subgroup();

        expect(subgroup.sum).to.equal(1600);
    });
});
