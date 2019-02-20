import { expect } from "chai";
import Population, { PopulationSubgroup } from "../src/models/Population";

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
            sum: 3200,
            parts: [1, 2, 3, 4]
        }),
        parts: [1, 2, 3, 4]
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

describe("Population", () => {
    it("can provide the indicesOfMajorSubgroups", () => {
        const population = new Population(
            {
                total: {
                    key: "TOTPOP",
                    name: "Total population",
                    sum: 2727771,
                    min: 14,
                    max: 12307
                },
                subgroups: [
                    {
                        key: "NH_WHITE",
                        name: "White population",
                        sum: 874800,
                        min: 0,
                        max: 3263
                    },
                    {
                        key: "NH_BLACK",
                        name: "Black population",
                        sum: 876046,
                        min: 0,
                        max: 7723
                    },
                    {
                        key: "HISP",
                        name: "Hispanic population",
                        sum: 783335,
                        min: 0,
                        max: 3526
                    },
                    {
                        key: "NH_ASIAN",
                        name: "Asian population",
                        sum: 145407,
                        min: 0,
                        max: 2208
                    },
                    {
                        key: "NH_AMIN",
                        name: "American Indian population",
                        sum: 3378,
                        min: 0,
                        max: 22
                    }
                ]
            },
            [0, 1, 2, 3]
        );
        expect(population.indicesOfMajorSubgroups()).to.deep.equal([1, 0, 2]);
    });
});
