import Layer from "./Layer";

export default function NumberMarkers(state, brush) {
    state.numbers = [];
    if (!state.problem || !state.problem.numberOfParts) {
        console.log("no numberOfParts for NumberMarkers");
        return;
    }
    if (state.plan.problem.type === "community") {
        console.log("not numbering on community of interest");
        return;
    }

    let numberMarkers = {},
        canv = document.createElement("canvas"),
        ctx = canv.getContext("2d"),
        i = 0,
        districts = [],
        map = state.units.map;
    canv.height = 22;
    while (i < state.problem.numberOfParts) {
        districts.push(i);
        i++;
    }
    districts.forEach((dnum) => {
        canv.width = 32;
        ctx.strokeStyle = "#000";
        ctx.fillStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.ellipse(16, 11, 14, 10, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#000";
        ctx.font = "14px sans-serif";
        ctx.fillText(
            dnum + 1,
            16 - ctx.measureText(dnum + 1).width / 2,
            16
        );
        // if (!dnum) {
        //     console.log(canv.toDataURL());
        // }

        map.addSource("number_source_" + dnum, {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] }
        });
        map.loadImage(canv.toDataURL(), (err, numberimg) => {
            if (err) {
                throw err;
            }
            map.addImage("number_icon_" + dnum, numberimg);
            state.numbers.push(new Layer(
                map,
                {
                    id: "number_layer_" + dnum,
                    source: "number_source_" + dnum,
                    type: "symbol",
                    paint: {
                        "icon-opacity": 1
                    },
                    layout: {
                        "icon-image": "number_icon_" + dnum,
                        "icon-size": 1
                    }
                }
            ));
        });
    });

    const updater = (state, colorsAffected) => {
        let plan = state.plan,
            place = state.place.id,
            extra_source = (state.units.sourceId === "ma_precincts_02_10") ? "ma_02" : 0,
            placeID = extra_source || place;
        if (plan && plan.assignment) {
            let markers = {},
                seenDistricts = new Set();

            // figure out which units belong to colors affected by the edit
            Object.keys(plan.assignment).forEach((unit_id) => {
                if (plan.assignment[unit_id] === null) {
                    return;
                }
                let district_num = Number(plan.assignment[unit_id]);
                seenDistricts.add(district_num);
                if (
                    (district_num || (district_num === 0))
                    && (!colorsAffected || colorsAffected.has(district_num))
                ) {
                    if (markers[district_num]) {
                        markers[district_num].push(unit_id);
                    } else {
                        markers[district_num] = [unit_id];
                    }
                }
            });

            let moveMarkers = Object.keys(markers);
            function check_district(d_index) {
                // up to 100 random GEOIDs in GET url
                // have requested help to POST
                if (d_index >= moveMarkers.length) {
                    return;
                }
                let district_num = moveMarkers[d_index];
                let filterOdds = 100 / markers[district_num].length;
                if (filterOdds < 1) {
                    markers[district_num] = markers[district_num].filter(() => (Math.random() < filterOdds));
                }

                fetch(`https://mggg-states.subzero.cloud/rest/rpc/merged_${placeID}?ids=${markers[district_num].join(",")}`).then(res => res.json()).then((centroid) => {
                    if (typeof centroid === "object") {
                        centroid = centroid[0][`merged_${placeID}`];
                    }
                    let latlng = centroid.split(" "),
                        lat = latlng[1].split(")")[0] * 1,
                        lng = latlng[0].split("(")[1] * 1;
                    if (numberMarkers[district_num]) {
                        numberMarkers[district_num].geometry.coordinates = [lng, lat];
                    } else {
                        numberMarkers[district_num] = {
                            type: "Feature",
                            geometry: { type: "Point", coordinates: [lng, lat] }
                        };
                    }
                    map.getSource("number_source_" + district_num).setData(numberMarkers[district_num]);
                    check_district(d_index + 1);
                }).catch(() => {
                    check_district(d_index + 1);
                });
            }
            check_district(0);

            // remove a number marker if the district has no units left on the map
            Object.keys(numberMarkers).forEach((previous_dnum) => {
                if (!seenDistricts.has(1 * previous_dnum)) {
                    map.getSource("number_source_" + previous_dnum).setData({ type: "FeatureCollection", features: [] });
                }
            });
        }
    };
    updater(state);
    return { update: updater };
}
