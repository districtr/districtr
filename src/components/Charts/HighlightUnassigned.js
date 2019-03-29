import {
    highlightUnassignedUnitBordersPaintProperty,
    unitBordersPaintProperty
} from "../../colors";
import toggle from "../Toggle";

export default function HighlightUnassigned(unitsBorders) {
    return toggle("Highlight unassigned units", false, highlight => {
        if (highlight) {
            unitsBorders.setPaintProperties(
                highlightUnassignedUnitBordersPaintProperty
            );
        } else {
            unitsBorders.setPaintProperties(unitBordersPaintProperty);
        }
    });
}
