let intervalCount = 5;

export function labelPopCount(subgroup) {
    let isVAP = subgroup.key.includes("VAP");
    document.querySelectorAll(`#counts-${isVAP ? "vap" : "demographics"} .square`)
        .forEach((sq, index) => {
            sq.innerText = subgroup.breaks[index].toLocaleString()
                + "-"
                + (subgroup.breaks[index + 1] - 1).toLocaleString();
    });
}

export function labelPopPercent(subgroup) {
    let isVAP = subgroup.key.includes("VAP");
    // populations to tenths or hundredths of a percent
    let decimals = (subgroup.breaks[1] <= 0.01) ? 2 : 1;
    document.querySelectorAll(`#percents-${isVAP ? "vap" : "demographics"} .square`)
        .forEach((square, index) => {
            let startPercent = (subgroup.breaks[index] * 100).toFixed(decimals);
            let endPercent = (subgroup.breaks[index + 1] * 100 - Math.pow(10, -1 * decimals)).toFixed(decimals);

            square.innerText = startPercent
                + "-"
                + endPercent + "%";
        });
}
