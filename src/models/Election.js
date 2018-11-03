import { sum, zeros } from "../utils";
import Tally from "./Tally";

export default class Election {
    constructor(id, name, partiesToColumns, numberOfParts) {
        this.id = id;
        this.partiesToColumns = partiesToColumns;
        this.parties = Object.keys(partiesToColumns);
        this.name = name;

        this.getVotes = this.getVotes.bind(this);
        this.update = this.update.bind(this);
        this.percent = this.percent.bind(this);

        this.votes = {};
        for (let party of this.parties) {
            this.votes[party] = new Tally(
                feature => this.getVotes(feature, party),
                zeros(numberOfParts)
            );
        }
    }
    getVotes(feature, party) {
        return parseInt(feature.properties[this.partiesToColumns[party]]);
    }
    totalVotes(feature) {
        return sum(this.parties.map(party => this.getVotes(feature, party)));
    }
    voteShare(feature, party) {
        const total = this.totalVotes(feature);
        return total > 0 ? this.getVotes(feature, party) / total : 0;
    }
    voteShareAsMapboxExpression(party) {
        let total = ["+"];
        for (let partyKey of this.parties) {
            total.push(["to-number", ["get", this.partiesToColumns[partyKey]]]);
        }
        const votes = ["to-number", ["get", this.partiesToColumns[party]]];
        return ["case", [">", votes, 0], ["/", votes, total], 0];
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
        return this.partiesToColumns[party];
    }
}
