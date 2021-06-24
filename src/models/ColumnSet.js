import { SumOfColumns } from "./NumericalColumn";
import { Subgroup } from "./Subgroup";

export default class ColumnSet {
    constructor({ subgroups, total, total_alt, parts, type }, sort = true) {
        this.type = type;
        this.subgroups = subgroups
            ? subgroups.map(
                  subgroup =>
                      new Subgroup({
                          ...subgroup,
                          parts,
                          columnSet: this
                      })
              )
            : [];

        if (sort && sortable(this.subgroups)) {
            this.subgroups = sortSubgroups(this.subgroups);
        }

        if (total !== undefined && total !== null) {
            this.total = new Subgroup({
                ...total,
                parts,
                columnSet: this
            });
        } else if (total !== null) {
            this.total = new SumOfColumns({
                columns: this.subgroups,
                columnSet: this,
                parts
            });
            this.totalIsSum = true;
        }
        if (total_alt) {
            this.total_alt = new Subgroup({
                ...total_alt,
                parts,
                columnSet: this
            });
        }

        this.update = this.update.bind(this);
    }
    update(feature, part, divisor) {
        this.subgroups.forEach(subgroup => subgroup.update(feature, part, divisor));
        this.total.update(feature, part, divisor);
    }
    get columns() {
        return [this.total, ...this.subgroups];
    }
}

function sortable(subgroups) {
    for (let subgroup of subgroups) {
        if (typeof subgroup.sum !== "number") {
            return false;
        }
    }
    return true;
}

function sortSubgroups(subgroups) {
    return subgroups.sort((s, t) => {
        if (s.name.includes("(") && !t.name.includes("(")) {
            return 1;
        } else if (t.name.includes("(") && !s.name.includes("(")) {
            return -1;
        } else {
            return t.sum - s.sum;
        }
    });
}
