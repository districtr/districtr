let intervalCount = 5;

export function labelZeroToHundredPercent() {
    document.querySelectorAll("#percents-demographics .square, #percents-vap .square")
        .forEach((square, ind) => {
            let index = ind % intervalCount;
            let percent = (100 / intervalCount * index);
            if (index === intervalCount - 1) {
                percent = "≥ " + percent;
            } else {
                percent += "-" + (20 * ((index % 5) + 1) - 1);
            }
            square.innerText = percent + "%";
        });
}

export function labelPopCount(total) {
    document.querySelectorAll("#counts-demographics .square, #counts-vap .square")
        .forEach((sq, ind) => {
            let index = ind % intervalCount;
            // if (index === 0) {
            //     return "≤ " + Math.floor(total * 0.2).toLocaleString();
            // }
            // if (index === 4) {
            //     return "≥ " + Math.floor(total * 0.8).toLocaleString();
            // }
            sq.innerText = Math.floor(total * index / intervalCount).toLocaleString()
                + "-"
                + Math.floor(total * (index + 1) / intervalCount - 1).toLocaleString();
    });
}

export function labelPopPercent(smallpop) {
    // populations to tenths or hundredths of a percent
    let decimals = (smallpop > 100) ? 2 : 1;
    document.querySelectorAll("#percents-demographics .square, #percents-vap .square")
        .forEach((square, ind) => {
            let index = ind % intervalCount;
            let startPercent = (index * 20 * smallpop).toFixed(index ? decimals : 0);
            let endPercent = ((index + 1) * 20 * smallpop - Math.pow(10, -1 * decimals)).toFixed(decimals);

            if (index === intervalCount - 1) {
                square.innerText = "≥ " + startPercent + "%";
            } else {
                square.innerText = startPercent
                    + "-"
                    + endPercent + "%";
            }
        });
}
