import { divideOrZeroIfNaN, zeros } from "../utils";
import NumericalColumn from "./NumericalColumn";

export class Subgroup extends NumericalColumn {
    constructor({ columnSet, parts, ...args }) {
        super(args);
        this.columnSet = columnSet;
        this.data = zeros(parts.length);
        this.total_alt = args.total_alt;
        this.divisor = args.divisor; // for turning a x1000 int back into decimal

        this.update = this.update.bind(this);
        this.fractionAsMapboxExpression = this.fractionAsMapboxExpression.bind(
            this
        );
        this.getFractionFromFeature = this.getFractionFromFeature.bind(this);
        this.getFractionInPart = this.getFractionInPart.bind(this);
        this.getOverallFraction = this.getOverallFraction.bind(this);
    }
    get total() {
        return this.total_alt ? this.columnSet.total_alt : this.columnSet.total;
    }
    getFractionFromFeature(feature) {
        return this.getValue(feature) / this.total.getValue(feature);
    }
    getFractionInPart(partIndex) {
        let total = this.total.data[partIndex];
        if (this.columnSet.totalIsSum) {
            total = 0;
            this.columnSet.subgroups.forEach(sg => total += sg.data[partIndex]);
        }
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
    update(feature, color, divisor=1) {
        let oldColors = String(feature.state ?
            (feature.state.color === undefined ? "" : feature.state.color)
            : "").split(",").filter(c => c !== "");
        let newColors = String(color).split(",");
        // note that JSON.stringify [0,undefined] == [0,null]
        // console.log(JSON.stringify((feature.state || {}).color) + " to " + JSON.stringify(color))

        if (color !== undefined && color !== null) {
            if (!oldColors.includes(String(color))) {
                // newColors usually receives one color at a time
                // except when loading multiple colors from a community plan
                newColors.filter(c => (c || (c === 0)) && (!oldColors.includes(c)))
                    .forEach((c) => {
                        // console.log("add to " + Number(c));
                        this.data[Number(c)] += this.getValue(feature) / divisor;
                    });
            }
        }

        // this happens on districting whenever a color is replaced
        // this happens on community only when erasing (overlap allowed)
        oldColors.filter(c => (c || (c === 0))).forEach((oldColor) => {
            if (!newColors.includes(oldColor)) {
                // console.log("subtract from " + Number(oldColor));
                this.data[Number(oldColor)] -= this.getValue(feature) / divisor;
            }
        });
    }
    getAbbreviation() {
        if (ABBREVIATIONS.hasOwnProperty(this.key)) {
            return ABBREVIATIONS[this.key];
        } else {
            let prelim = this.name.split(" ")[0];
            if (prelim === "American" || this.key.includes("native")) {
              return "Native Am.";
            } else if (prelim === "Native" && !this.key.includes("American")) {
              return "NH/PI";
            }
            return prelim;
        }
    }
}

const ABBREVIATIONS = {

    NH_WHITE: "White",
    NH_BLACK: "Black",
    HISP: "Hispanic",
    NH_ASIAN: "Asian",
    NH_AMIN: "Native",
    AMIN: "AmIn/Alaskan",
    "AMINPOP20": "Native Am.",
    "VNAMIND": "Native Am.",
    NH_NHPI: "NH/PI",
    NHPI: "NH/PI",
    "NHPIPOP20": "NH/PI",
    NH_2MORE: "2+",
    "2MORE": "2+",
    NH_OTHER: "Other",
    WVAP: "WVAP",
    BVAP: "BVAP",
    HVAP: "HVAP",
    AMINVAP: "Native VAP",
    NHPIVAP: "NHPI VAP",
    ASIANVAP: "AVAP",
    AKNATVAP: "AK Native VAP",
    OTHERVAP: "Other VAP",
    OTHVAP: "Other VAP",
    "2MOREVAP": "2+ VAP",
    "AMINVAP20": "Native Am.",
    "NHPIVAP20": "NH/PI",
    Others: "Wh/Oth",
    CVAP_Others: "Wh/Oth",
};
