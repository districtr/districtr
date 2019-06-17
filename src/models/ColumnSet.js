import { SumOfColumns } from "./NumericalColumn";
import { Subgroup } from "./Subgroup";

export default class ColumnSet {
    constructor({ subgroups, total, parts, type }, sort = true) {
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
        } else {
            this.total = new SumOfColumns({
                columns: this.subgroups,
                columnSet: this,
                parts
            });
        }

        this.update = this.update.bind(this);
    }
    update(feature, part) {
        this.subgroups.forEach(subgroup => subgroup.update(feature, part));
        this.total.update(feature, part);
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
    return subgroups.sort((s, t) => t.sum - s.sum);
}
