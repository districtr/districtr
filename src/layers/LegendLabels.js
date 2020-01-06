let intervalCount = 5;

export function labelPopCount(subgroup) {
    let isVAP = subgroup.key.includes("VAP");
    document.querySelectorAll(`.counts-${isVAP ? "vap" : "demographics"} .square`)
        .forEach((sq, ind) => {
            let index = ind % 5;
            sq.innerHTML = subgroup.breaks[index].toLocaleString()
                + "-<br/>"
                + (subgroup.breaks[index + 1] - 1).toLocaleString();
    });
}

export function labelPopPercent(subgroup) {
    let isVAP = subgroup.key.includes("VAP");
    let cropToDecimal = (num, ending) => {
        let decimals = 0;
        if (num > 0) {
            if (num < 10) {
                decimals++;
            }
            if (num < 1) {
                decimals++;
            }
        }
        return (ending ? (num - Math.pow(10, -1 * decimals)) : num).toFixed(decimals);
    };
    // populations to tenths or hundredths of a percent
    document.querySelectorAll(`.counts-${isVAP ? "vap" : "demographics"} > .square`)
        .forEach((square, ind) => {
            let index = ind % 5;
            let startPercent = cropToDecimal(subgroup.breaks[index] * 100, false);
            let endPercent = cropToDecimal(subgroup.breaks[index + 1] * 100, index < 4);

            square.innerHTML = startPercent
                + "-<br/>"
                + endPercent + "%";
        });
}
