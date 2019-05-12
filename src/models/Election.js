import ColumnSet from "./ColumnSet";

export default class Election extends ColumnSet {
    constructor(name, subgroups, parts) {
        const sortedSubgroups = subgroups.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
        super({ subgroups: sortedSubgroups, parts }, false);
        this.name = name;

        this.getOtherParty = this.getOtherParty.bind(this);
        this.marginAsMapboxExpression = this.marginAsMapboxExpression.bind(
            this
        );
    }
    get parties() {
        return this.subgroups;
    }
    get columns() {
        return this.subgroups;
    }
    /**
     * Return the other party in the election.
     * @todo Figure out what to do when
     * @param {Subgroup} party
     */
    getOtherParty(party) {
        return party === this.subgroups[0]
            ? this.subgroups[1]
            : this.subgroups[0];
    }
    marginAsMapboxExpression(party) {
        const otherParty = this.getOtherParty(party);
        return [
            "-",
            party.asMapboxExpression(),
            otherParty.asMapboxExpression()
        ];
    }
}
