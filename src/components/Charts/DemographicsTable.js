import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";

function getCellStyle() {
    return `background: #f9f9f9`;
}

export default (subgroups, parts) =>
    DataTable(
        "Demographic Balance",
        subgroups,
        parts,
        subgroup => subgroup.name,
        getCellStyle,
        (subgroup, i) => subgroup.tally.data[i] / subgroup.total.tally.data[i],
        percent => roundToDecimal(percent * 100, 2)
    );
