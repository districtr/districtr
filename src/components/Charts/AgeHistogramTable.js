import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Parameter from "../Parameter";
import Select from "../Select";
import DemographicsTable from "./DemographicsTable";
import Histogram from "./Histogram";

export default function AgeHistogramTable(
    chartId,
    population,
    parts,
    chartState,
    dispatch
) {
    const subgroups = population.subgroups.map((p) => {
        p.name = p.name.replace("Ages ", "").replace("Age ", "").replace("Under ", "<");
        return p;
    });

    let combinedAges = [
      {name: "<15", keys: ["P012003", "P012004", "P012005"]},
      {name: "15–20", keys: ["P012006", "P012007", "P012008"]},
      {name: "21–34", keys: ["P012009", "P012010", "P012011", "P012012"]},
      {name: "35–49", keys: ["P012013", "P012014", "P012015"]},
      {name: "50–64", keys: ["P012016", "P012017", "P012018", "P012019"]},
      {name: "65+", keys: ["P012020", "P012021", "P012022", "P012023", "P012024", "P012025"]}
    ];
    combinedAges.forEach(age => {
      // mimic subgroup model
      age.keys.forEach((key) => {
          age.keys.push(key + "_mf");
          age.keys.push(key.replace(/0120+/, ""));
      });
      age.getAbbreviation = () => age.name;
      age.getSum = (partIndex) => {
        let sum = 0;
        subgroups.forEach(g => {
          if (age.keys.includes(g.key)) {
            sum += g.data[partIndex];
          }
        });
        return sum;
      };
      age.getFractionInPart = (partIndex) => {
        let sum = age.getSum(partIndex),
            total = subgroups[0].total.data[partIndex];
        return (sum === 0) ? 0 : (sum / total);
      };

      age.sum = 0;
      age.total = { sum: 0 };
      subgroups.forEach(g => {
        if (age.keys.includes(g.key)) {
          age.sum += g.sum;
        }
        if (!age.total.sum) {
          age.total.sum = g.total.sum;
        }
      });
    });

    let onChange = (e) => {
      dispatch(
          actions.selectAgeView({
              chart: chartId,
              ageView: e
          })
      );
    };

    return html`
        <section class="toolbar-section">
            ${Parameter({
                label: "View as:",
                element: Select([{name:"Histogram"}, {name:"Percentage"}, {name:"Population"}], onChange)
            })}
            ${chartState.ageView == 1 ? DemographicsTable(combinedAges, parts, false) : null}
            ${chartState.ageView == 2 ? DemographicsTable(combinedAges, parts, "population") : null}
            ${chartState.ageView ? null : Histogram(population.subgroups, parts)}
        </section>
    `;
}
