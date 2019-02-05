import { divideOrZeroIfNaN, sum, zeros } from "../utils";
import Tally from "./Tally";

export default class Election {
    constructor(name, voteTotals, numberOfParts) {
        this.partiesToColumns = voteTotals.reduce(
            (table, column) => ({ ...table, [column.name]: column }),
            {}
        );
        this.parties = voteTotals.map(column => column.name);
        this.columns = this.parties.map(party => this.partiesToColumns[party]);
        this.name = name;

        this.bindMethods();

        this.votes = {};
        for (let party of this.parties) {
            this.votes[party] = new Tally(
                feature => this.getVotes(feature, party),
                zeros(numberOfParts)
            );
        }
    }
    bindMethods() {
        this.getOtherParty = this.getOtherParty.bind(this);
        this.getVotes = this.getVotes.bind(this);
        this.totalVotes = this.totalVotes.bind(this);
        this.voteShare = this.voteShare.bind(this);
        this.voteMargin = this.voteMargin.bind(this);
        this.update = this.update.bind(this);
        this.percent = this.percent.bind(this);
        this.voteShareAsMapboxExpression = this.voteShareAsMapboxExpression.bind(
            this
        );
        this.voteCountAsMapboxExpression = this.voteCountAsMapboxExpression.bind(
            this
        );
        this.marginAsMapboxExpression = this.marginAsMapboxExpression.bind(
            this
        );
    }
    getVotes(feature, party) {
        // Use float in case the numbers have been interpolated
        return parseFloat(feature.properties[this.partiesToColumns[party].key]);
    }
    totalVotes(feature) {
        return sum(this.parties.map(party => this.getVotes(feature, party)));
    }
    voteShare(feature, party) {
        const total = this.totalVotes(feature);
        return total > 0 ? this.getVotes(feature, party) / total : 0;
    }
    /**
     * The absolute (integer, not percentage) vote margin that the given party
     * had in this election. If the party lost the election, the margin is
     * negative.
     * @param {object} feature
     * @param {string} party
     */
    voteMargin(feature, party) {
        const otherParty = this.getOtherParty(party);
        return (
            this.getVotes(feature, party) - this.getVotes(feature, otherParty)
        );
    }
    getOtherParty(party) {
        return party === this.parties[0] ? this.parties[1] : this.parties[0];
    }
    marginAsMapboxExpression(party) {
        const otherParty = this.getOtherParty(party);
        return [
            "-",
            this.voteCountAsMapboxExpression(party),
            this.voteCountAsMapboxExpression(otherParty)
        ];
    }
    voteCountAsMapboxExpression(party) {
        return ["to-number", ["get", this.partiesToColumns[party].key]];
    }
    voteShareAsMapboxExpression(party) {
        let total = ["+"];
        for (let partyKey of this.parties) {
            total.push(this.voteCountAsMapboxExpression(partyKey));
        }
        const votes = this.voteCountAsMapboxExpression(party);
        return divideOrZeroIfNaN(votes, total);
    }
    update(feature, part) {
        for (let party in this.votes) {
            this.votes[party].update(feature, part);
        }
    }
    percent(party, part) {
        let total = 0;
        for (let p in this.votes) {
            total += this.votes[p].data[part];
        }
        if (total === 0) {
            return 0;
        }
        return this.votes[party].data[part] / total;
    }
    getColumnName(party) {
        return this.partiesToColumns[party].key;
    }
    /**
     * TODO
     * @param {string} party
     */
    overallVoteShare(party) {
        return this.overallVotes(party) / this.overallTotalVotes();
    }
    /**
     * TODO
     * @param {string} party
     */
    overallVotes(party) {
        return this.partiesToColumns[party].sum;
    }
    /**
     * TODO
     */
    overallTotalVotes() {
        return sum(this.parties.map(party => this.overallVotes(party)));
    }
}
