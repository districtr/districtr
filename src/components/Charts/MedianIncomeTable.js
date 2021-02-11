import { html } from "lit-html";
import DataTable from "./DataTable";

const readable_income = {
  in_0_10: "< $10k",
  in_10_15: "$10-15k",
  in_15_20: "$15-20k",
  in_20_25: "$20-25k",
  in_25_30: "$25-30k",
  in_30_35: "$30-35k",
  in_35_40: "$35-40k",
  in_40_45: "$40-45k",
  in_45_50: "$45-50k",
  in_50_60: "$50-60k",
  in_60_75: "$60-75k",
  in_75_100: "$75-100k",
  in_100_125: "$100-125k",
  in_125_150: "$125-150k",
  in_150_200: "$150-200k",
  in_200_plus: "> $200k",
};

export default function MedianIncomeTable(
    income,
    parts,
    chartState,
    dispatch
) {
    income.subgroups = income.subgroups.sort((a, b) => a.key < b.key ? -1 : 1);

    let rows = parts.map((part, i) => {
        let median_count = 0;
        income.subgroups.forEach(sg => median_count += sg.data[i] / 2);
        let m;
        for (m = 0; m < income.subgroups.length - 1; m++) {
            median_count -= income.subgroups[m].data[i];
            if (median_count <= 0) {
                break;
            }
        }
        return {
            label: part.renderLabel(),
            entries: [{
                content: median_count ? readable_income[income.subgroups[m].name] : "",
                style: ""
            }]
        };
    });

    let median_total = 0;
    income.subgroups.forEach(sg => median_total += sg.sum / 2);

    let total_sg;
    for (total_sg = 0; total_sg < income.subgroups.length - 1; total_sg++) {
        median_total -= income.subgroups[total_sg].sum;
        if (median_total <= 0) {
            break;
        }
    }

    rows.push({
        label: "Overall",
        entries: [{
            content: median_total ? readable_income[income.subgroups[total_sg].name] : "",
            style: ""
        }]
    });

    return html`
        <section class="toolbar-section income-table">
          ${DataTable(["Median"], rows)}
        </section>
    `;
}
