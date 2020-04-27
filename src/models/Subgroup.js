import { divideOrZeroIfNaN, zeros } from "../utils";
import NumericalColumn from "./NumericalColumn";

export class Subgroup extends NumericalColumn {
    constructor({ columnSet, parts, ...args }) {
        super(args);
        this.columnSet = columnSet;
        this.data = zeros(parts.length);

        this.update = this.update.bind(this);
        this.fractionAsMapboxExpression = this.fractionAsMapboxExpression.bind(
            this
        );
        this.getFractionFromFeature = this.getFractionFromFeature.bind(this);
        this.getFractionInPart = this.getFractionInPart.bind(this);
        this.getOverallFraction = this.getOverallFraction.bind(this);
    }
    get total() {
        return this.columnSet.total;
    }
    getFractionFromFeature(feature) {
        return this.getValue(feature) / this.total.getValue(feature);
    }
    getFractionInPart(partIndex) {
        const total = this.total.data[partIndex];
        return total > 0 ? this.data[partIndex] / total : 0;
    }
    getOverallFraction() {
        const total = this.total.sum;
        return total > 0 ? this.sum / total : 0;
    }
    fractionAsMapboxExpression() {
        return divideOrZeroIfNaN(
            this.asMapboxExpression(),
            this.total.asMapboxExpression()
        );
    }
    update(feature, color) {
        let oldColors = String(feature.state ?
            (feature.state.color === undefined ? "" : feature.state.color)
            : "").split(",");
        let newColors = String(color).split(",");

        if (color !== undefined && color !== null) {
            if (!oldColors.includes(String(color))) {
                // newColors usually receives one color at a time
                // except when loading multiple colors from a community plan
                newColors.forEach((c) => {
                    this.data[Number(c)] += this.getValue(feature);
                });
            }
        }
        if (
            feature.state !== undefined &&
            feature.state.color !== undefined &&
            feature.state.color !== null
        ) {
            if (color === null || !feature.state.COI) {
                // this happens on districting whenever a color is replaced
                // this happens on community only when erasing (overlap allowed)
                oldColors.forEach((oldColor) => {
                    this.data[Number(oldColor)] -= this.getValue(feature);
                });
            }
            // else if (feature.state.COI && oldColors.length > 1 && newColors.length) {
            //     console.log(oldColors);
            //     console.log('to');
            //     console.log(newColors);
            //     oldColors.filter(c => !newColors.includes(String(c))).forEach((oldColor) => {
            //         console.log('remove ' + oldColor);
            //         this.data[Number(oldColor)] -= this.getValue(feature);
            //     });
            // }
        }
    }
    getAbbreviation() {
        if (ABBREVIATIONS.hasOwnProperty(this.key)) {
            return ABBREVIATIONS[this.key];
        } else {
            return this.name.split(" ")[0];
        }
    }
}

const ABBREVIATIONS = {
    NH_WHITE: "White",
    NH_BLACK: "Black",
    HISP: "Hispanic",
    NH_ASIAN: "Asian",
    NH_AMIN: "Native",
    NH_NHPI: "NHPI",
    NH_2MORE: "2+",
    NH_OTHER: "Other",
    WVAP: "WVAP",
    BVAP: "BVAP",
    HVAP: "HVAP",
    AMINVAP: "Native VAP",
    NHPIVAP: "NHPI VAP",
    ASIANVAP: "AVAP",
    OTHERVAP: "Other VAP",
    OTHVAP: "Other VAP",
    "2MOREVAP": "2+ VAP"
};
