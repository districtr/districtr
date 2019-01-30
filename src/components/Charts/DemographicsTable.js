import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";

function getPercent(subgroup, i) {
    const total = subgroup.total.tally.data[i];
    return total > 0 ? subgroup.tally.data[i] / total : 0;
}

export default (subgroups, parts) => {
    const width = `${Math.round(90 / subgroups.length)}%`;
    return DataTable(
        subgroups,
        parts,
        subgroup => subgroup.name.split(" ")[0],
        () => `background: #f9f9f9; width: ${width}`,
        getPercent,
        percent => roundToDecimal(percent * 100, 1)
    );
};
