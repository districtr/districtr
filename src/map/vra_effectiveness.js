export default function VRAEffectiveness(state, brush) {
    let place = state.place.id,
      extra_source = (state.units.sourceId === "ma_precincts_02_10") ? "ma_02" : 0;
  if (state.units.sourceId === "ma_towns") {
      extra_source = "ma_towns";
  }
  const placeID = extra_source || place;
  const sep = (state.place.id === "louisiana") ? ";" : ",";

  if (!state.vra_effectiveness) {
    state.vra_effectiveness = {};
  }

  const vraupdater = (state) => {
    // Object.keys(state.plan.assignment).map((k, i) => {
    //     state.plan.assignment[k] = Array.isArray(state.plan.assignment[k]) ? state.plan.assignment[k][0] : state.plan.assignment[k]
    // })
    let assign = Object.fromEntries(Object.entries(state.plan.assignment).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));

    // console.log(state);
    // console.log(assign)
    let saveplan = state.serialize();
    // console.log(JSON.stringify(saveplan));
    const GERRYCHAIN_URL = "//mggg.pythonanywhere.com";
    fetch(GERRYCHAIN_URL + "/vra", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
          "assignment": assign,
          "placeId": state.place.id
      }),
    })
      .then((res) => res.json())
      .catch((e) => console.error(e))
      .then((data) => {
        // console.log(data);
        state.vra_effectiveness = data;
      });
  };
  vraupdater(state);
  return vraupdater;
}