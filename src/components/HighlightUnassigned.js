import {
    highlightUnassignedUnitBordersPaintProperty,
    unitBordersPaintProperty
} from "../colors";
import Toggle from "./Toggle";

export function HighlightUnassigned(unitsBorders) {
    return Toggle("Highlight unassigned units", false, highlight => {
        if (highlight) {
            unitsBorders.setPaintProperties(
                highlightUnassignedUnitBordersPaintProperty
            );
        } else {
            unitsBorders.setPaintProperties(unitBordersPaintProperty);
        }
    });
}
