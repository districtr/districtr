import Tally from "./Charts/Tally";

export default class Election {
    constructor(id, parties, parts) {
        this.id = id;
        this.parties = parties;

        this.getVotes = this.getVotes.bind(this);
        this.update = this.update.bind(this);
        this.percent = this.percent.bind(this);

        this.votes = {};
        for (let party in parties) {
            this.votes[party] = new Tally(
                feature => this.getVotes(feature, party),
                parts.map(() => 0)
            );
        }
    }
    getVotes(feature, party) {
        return feature.properties[this.parties[party]];
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
}
