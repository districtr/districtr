export function zeros(n) {
    let vector = [];
    for (let i = 0; i < n; i++) {
        vector.push(0);
    }
    return vector;
}

/**
 * Summarize an array of data. Returns `{min, max, total, length}`.
 *
 * @param {string or function} getter The string key of one of the feature's
 *  properties, or a function mapping each feature to the desired data.
 */
export function summarize(data) {
    return {
        min: Math.min(...data),
        max: Math.max(...data),
        total: sum(data),
        length: data.length
    };
}

// From https://stackoverflow.com/questions/2901102/
// how-to-print-a-number-with-commas-as-thousands-separators-in-javascript#2901298
export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function roundToDecimal(n, places) {
    return Math.round(n * Math.pow(10, places)) / Math.pow(10, places);
}

export function sum(values) {
    return values.reduce((total, value) => total + value, 0);
}

export function divideOrZeroIfNaN(x, y) {
    return ["case", [">", y, 0], ["/", x, y], 0];
}

export function extent(values) {
    return Math.min(...values) - Math.max(...values);
}

export function asPercent(value, total) {
    return `${Math.round(100 * (value / total))}%`;
}

export function replace(list, i, item) {
    return [...list.slice(0, i), item, ...list.slice(i + 1)];
}

// Light-weight redux implementation

export function createReducer(handlers) {
    return (state, action) => {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action);
        }
        return state;
    };
}

export function combineReducers(reducers) {
    return (state, action) => {
        let hasChanged = false;
        let nextState = {};

        for (let key in reducers) {
            nextState[key] = reducers[key](state[key], action);
            hasChanged = hasChanged || nextState[key] !== state[key];
        }

        return hasChanged ? nextState : state;
    };
}

export function createActions(handlers) {
    let actions = {};
    for (let actionType in handlers) {
        actions[actionType] = actionInfo => ({
            ...actionInfo,
            type: actionType
        });
    }
    return actions;
}

export function bindDispatchToActions(actions, dispatch) {
    let boundActions = {};
    for (let actionType in actions) {
        boundActions[actionType] = actionInfo =>
            dispatch(boundActions[actionType](actionInfo));
    }
    return boundActions;
}

/**
 * Handle HTTP responses by providing handlers for HTTP status codes.
 *
 * The `handlers` object should have handlers for each status code you want
 * to handle (e.g. 200, 500) as well as a "default" handler for all other
 * cases.
 *
 * @param {object} handlers
 */
export function handleResponse(handlers) {
    handlers = {
        // eslint-disable-next-line no-console
        default: resp => console.error("Request failed", resp),
        ...handlers
    };
    return response => {
        if (handlers.hasOwnProperty(response.status)) {
            return handlers[response.status](response);
        } else {
            return handlers.default(response);
        }
    };
}

export function isString(x) {
    return typeof x === "string" || x instanceof String;
}

// Copied from stackoverflow https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
export function dec2hex(dec) {
    return ("0" + dec.toString(16)).substr(-2);
}

export function generateId(len) {
    const arr = new Uint8Array((len || 40) / 2);
    const crypto = window.crypto ? window.crypto : window.msCrypto;
    crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join("");
}

export function download(filename, text, isbinary) {
    let blob;
    if (isbinary) {
      blob = new Blob([text], {
        type: 'application/octet-stream'
      });
    }
    let element = document.createElement("a");
    element.setAttribute(
        "href",
        isbinary
          ? window.URL.createObjectURL(blob)
          : "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

export function bindAll(keys, obj) {
    keys.forEach(key => {
        obj[key] = obj[key].bind(obj);
    });
}

export function boundsOfGJ(gj) {
  var coords, bbox;
  if (!gj.hasOwnProperty('type')) return;
  coords = getCoordinatesDump(gj);
  bbox = [ Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY,];
  return coords.reduce(function(prev,coord) {
    return [
      Math.min(coord[0], prev[0]),
      Math.min(coord[1], prev[1]),
      Math.max(coord[0], prev[2]),
      Math.max(coord[1], prev[3])
    ];
  }, bbox);
};

function getCoordinatesDump(gj) {
  var coords;
  if (gj.type == 'Point') {
    coords = [gj.coordinates];
  } else if (gj.type == 'LineString' || gj.type == 'MultiPoint') {
    coords = gj.coordinates;
  } else if (gj.type == 'Polygon' || gj.type == 'MultiLineString') {
    coords = gj.coordinates.reduce(function(dump,part) {
      return dump.concat(part);
    }, []);
  } else if (gj.type == 'MultiPolygon') {
    coords = gj.coordinates.reduce(function(dump,poly) {
      return dump.concat(poly.reduce(function(points,part) {
        return points.concat(part);
      },[]));
    },[]);
  } else if (gj.type == 'Feature') {
    coords =  getCoordinatesDump(gj.geometry);
  } else if (gj.type == 'GeometryCollection') {
    coords = gj.geometries.reduce(function(dump,g) {
      return dump.concat(getCoordinatesDump(g));
    },[]);
  } else if (gj.type == 'FeatureCollection') {
    coords = gj.features.reduce(function(dump,f) {
      return dump.concat(getCoordinatesDump(f));
    },[]);
  }
  return coords;
}

export const COUNTIES_TILESET = {
    sourceLayer: "cb_2018_us_county_500k-6p4p3f",
    source: { type: "vector", url: "mapbox://districtr.6fcd9f0h" }
};

export const stateNameToFips = {
    alabama: "01",
    alaska: "02",
    arizona: "04",
    arkansas: "05",
    california: "06",
    colorado: "08",
    connecticut: "09",
    delaware: 10,
    "district of columbia": 11,
    district_of_columbia: 11,
    florida: 12,
    georgia: 13,
    hawaii: 15,
    idaho: 16,
    illinois: 17,
    indiana: 18,
    iowa: 19,
    kansas: 20,
    kentucky: 21,
    louisiana: 22,
    maine: 23,
    maryland: 24,
    massachusetts: 25,
    ma: 25,
    michigan: 26,
    minnesota: 27,
    mississippi: 28,
    missouri: 29,
    montana: 30,
    nebraska: 31,
    nevada: 32,
    "new hampshire": 33,
    new_hampshire: 33,
    "new jersey": 34,
    new_jersey: 34,
    "new mexico": 35,
    new_mexico: 35,
    "new york": 36,
    new_york: 36,
    "north carolina": 37,
    north_carolina: 37,
    nc: 37,
    "north dakota": 38,
    north_dakota: 38,
    ohio: 39,
    oklahoma: 40,
    oregon: 41,
    pennsylvania: 42,
    "rhode island": 44,
    rhode_island: 44,
    "south carolina": 45,
    south_carolina: 45,
    "south dakota": 46,
    south_dakota: 46,
    tennessee: 47,
    texas: 48,
    utah: 49,
    vermont: 50,
    virginia: 51,
    washington: 53,
    "west virginia": 54,
    west_virginia: 54,
    wisconsin: 55,
    wyoming: 56,
    "puerto rico": 72,
    puerto_rico: 72
};

export function spatial_abilities (id) {
  const status = {
      alabama: {
        multiyear: 2018,
        native_american: true,
        number_markers: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
      alaska: {
        number_markers: true,
        // precincts cross county lines
        native_american: true,
        shapefile: true,
        // find_unpainted: true,
      },
      arizona: {
        number_markers: true,
        county_brush: true,
        native_american: true,
        coalition: true,
        shapefile: true,
        // find_unpainted: true,
      },
          maricopa: {
            native_american: true,
            coalition: true,
            number_markers: true,
          },
          nwaz: {
            native_american: true,
            coalition: true,
            number_markers: true,
          },
          seaz: {
            native_american: true,
            coalition: true,
            number_markers: true,
          },
          phoenix: {
            native_american: true,
            coalition: true,
            number_markers: true,
          },
          yuma: {
            native_american: true,
            coalition: true,
            number_markers: true,
          },
      arkansas: {
        multiyear: 2018,
        number_markers: true,
        county_brush: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
      california: {
        number_markers: true,
        native_american: true,
        county_brush: true,
        shapefile: true,
        // find_unpainted: true,
      },
        ccsanitation: {
          screenshot: true,
          // multiyear: 2018,
          shapefile: true,
        },
        ccsanitation2: {
          screenshot: true,
          multiyear: 2018,
          shapefile: true,
        },
      chicago: {
        number_markers: true,
        multiyear: 2019,
      },
      colorado: {
        number_markers: true,
        county_brush: true,
        native_american: true,
        contiguity: 2,
        shapefile: true,
        find_unpainted: true,
        screenshot: true,
      },
      connecticut: {
        county_brush: true,
        native_american: true,
        number_markers: true,
        contiguity: 2,
        shapefile: true,
        find_unpainted: true,
      },
      dc: {
        multiyear: 2018,
        number_markers: true,
        contiguity: 2,
        shapefile: true,
        find_unpainted: true,
      },
      delaware: {
        number_markers: true,
        native_american: true,
        contiguity: 2,
        shapefile: true,
        find_unpainted: true,
      },
      florida: {
        native_american: true,
        number_markers: true,
        multiyear: 2018,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
          miamifl: {
            number_markers: true,
            neighborhoods: true,
            coalition: true,
          },
          miamidade: {
            multiyear: 2018,
            number_markers: true,
            neighborhoods: true,
            coalition: true,
          },
      georgia: {
        number_markers: true,
        county_brush: true,
        contiguity: 2,
        shapefile: true,
        find_unpainted: true,
      },
      hawaii: {
        number_markers: true,
        native_american: true,
        county_brush: true,
        shapefile: true,
      },
      idaho: {
        multiyear: 2018,
        native_american: true,
        number_markers: true,
        county_brush: true,
        shapefile: true,
        contiguity: true,
        find_unpainted: true,
      },
      illinois: {
        number_markers: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
      indiana: {
        multiyear: 2018,
        number_markers: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
      iowa: {
        number_markers: true,
        contiguity: 2,
        screenshot: true,
        shapefile: true,
        // find_unpainted: true,
      },
      kansas: {
        multiyear: 2018,
        native_american: true,
        number_markers: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
      kentucky: {
        multiyear: 2018,
        number_markers: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
      lax: {
        neighborhoods: true,
        number_markers: true,
        contiguity: 2,
        shapefile: true,
        find_unpainted: true,
      },
      little_rock: {
        number_markers: true,
      },
      louisiana: {
        native_american: true,
        county_brush: true, // lakes
        number_markers: true,
        contiguity: 2,
        shapefile: true,
        coalition: true,
        screenshot: true,
        find_unpainted: true,
      },
        batonrouge: {
          coalition: true,
          number_markers: true,
          shapefile: true,
          screenshot: true,
          // find_unpainted: true, COI only
        },
      maine: {
        native_american: true,
        number_markers: true,
        shapefile: true,
        find_unpainted: true,
      },
      maryland: {
        number_markers: true,
        county_brush: true,
        screenshot: true,
        absentee: true,
        shapefile: true,
        find_unpainted: true,
      },
      ma: {
        number_markers: true,
        shapefile: true,
        // find_unpainted: true,
      },
        lowell: {
          neighborhoods: true,
          contiguity: 2,
          number_markers: true,
          shapefile: true,
          // find_unpainted: true,
        },
      michigan: {
        number_markers: true,
        native_american: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
        screenshot: true,
      },
      minnesota: {
        number_markers: true,
        county_brush: true,
        native_american: true,
        shapefile: true,
        find_unpainted: true,
      },
        olmsted: {
          number_markers: true,
        },
        rochestermn: {
          number_markers: true,
        },
      mississippi: {
        number_markers: true,
        county_brush: true,
        native_american: true,
        contiguity: 2,
        shapefile: true,
        find_unpainted: true,
      },
      missouri: {
        multiyear: 2018,
        number_markers: true,
        county_brush: true,
        shapefile: true,
        // find_unpainted: true,
      },
      montana: {
        multiyear: 2018,
        native_american: true,
        number_markers: true,
        shapefile: true,
        find_unpainted: true,
      },
      napa: {
        number_markers: true,
      },
      napaschools: {
        number_markers: true,
      },
      nebraska: {
        // multiyear: 2018,
        // number_markers: true,
        native_american: true,
        county_brush: true,
        absentee: true,
        shapefile: true,
        // find_unpainted: true,
      },
      nevada: {
        multiyear: 2018,
        native_american: true,
        number_markers: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
      newhampshire: {
        number_markers: true,
        shapefile: true,
        // find_unpainted: true,
      },
      newjersey: {
        number_markers: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
      new_mexico: {
        number_markers: true,
        county_brush: true,
        native_american: true,
        contiguity: 2,
        current_districts: true,
        screenshot: true,
        shapefile: true,
        find_unpainted: true,
        coalition: true,
      },
        new_mexico_bg: {
          native_american: true,
          shapefile: true,
          screenshot: true,
          current_districts: true,
          county_brush: true,
          coalition: true,
          // find_unpainted: true,
        },
        santafe: {
          number_markers: true,
          contiguity: 2,
          screenshot: true,
          shapefile: true,
          coalition: true,
          // find_unpainted: true,
        },
      newyork: {
        number_markers: true,
        county_brush: true,
        native_american: true,
        shapefile: true,
        // find_unpainted: true,
      },
      nc: {
        number_markers: true,
        county_brush: true,
        native_american: true,
        coi2: true,
        current_districts: true,
        shapefile: true,
        find_unpainted: true,
      },
          forsyth_nc: {
            contiguity: 2,
            screenshot: true,
            shapefile: true,
          },
          buncombe: {
            contiguity: 2,
            screenshot: true,
            shapefile: true,
            number_markers: true,
          },
      northdakota: {
        multiyear: 2018,
        native_american: true,
        number_markers: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
      ohio: {
        number_markers: true,
        county_brush: true,
        shapefile: true,
        // find_unpainted: true - needs contiguity
      },
        ohcentral: {
          multiyear: 2019,
          number_markers: true,
          coalition: true,
          shapefile: true,
          screenshot: true,
        },
        ohakron: {
          multiyear: 2019,
          number_markers: true,
          coalition: true,
          shapefile: true,
          screenshot: true,
        },
        ohcin: {
          multiyear: 2019,
          number_markers: true,
          coalition: true,
          shapefile: true,
          screenshot: true,
        },
        ohcle: {
          multiyear: 2019,
          number_markers: true,
          coalition: true,
          shapefile: true,
          screenshot: true,
        },
        ohse: {
          multiyear: 2019,
          number_markers: true,
          coalition: true,
          shapefile: true,
          screenshot: true,
        },
        ohtoledo: {
          multiyear: 2019,
          number_markers: true,
          coalition: true,
          shapefile: true,
          screenshot: true,
        },
        akroncanton: {
          number_markers: true,
          coalition: true,
        },
        cincinnati: {
          number_markers: true,
          coalition: true,
        },
        clevelandeuclid: {
          number_markers: true,
          coalition: true,
        },
        columbus: {
          number_markers: true,
          coalition: true,
        },
        dayton: {
          number_markers: true,
          coalition: true,
        },
        limaoh: {
          number_markers: true,
          coalition: true,
        },
        mansfield: {
          number_markers: true,
          coalition: true,
        },
        portsmouthoh: {
          number_markers: true,
          coalition: true,
        },
        toledo: {
          number_markers: true,
          coalition: true,
        },
        youngstown: {
          number_markers: true,
          coalition: true,
        },
      oklahoma: {
        number_markers: true,
        native_american: true,
        county_brush: true,
        contiguity: 2,
        coalition: true,
        shapefile: true,
        find_unpainted: true,
      },
      ontarioca: {
        number_markers: true,
      },
      oregon: {
        number_markers: true,
        county_brush: true,
        native_american: true,
        contiguity: 2,
        shapefile: true,
        find_unpainted: true,
      },
        portlandor: {
          number_markers: true,
          contiguity: 2,
        },
      pennsylvania: {
        number_markers: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
        philadelphia: {
          number_markers: true,
          contiguity: 2,
          find_unpainted: true,
        },
      puertorico: {
        number_markers: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
        puertorico_prec: {
          number_markers: true,
          parties: ["Nuevo Progresista", "Popular Democrático"],
          shapefile: true,
          // find_unpainted: true,
        },
      rhode_island: {
        number_markers: true,
        shapefile: true,
      },
      southcarolina: {
        multiyear: 2018,
        native_american: true,
        number_markers: true,
        county_brush: true,
        shapefile: true,
      },
      southdakota: {
        multiyear: 2018,
        native_american: true,
        number_markers: true,
        county_brush: true,
        shapefile: true,
      },
      tennessee: {
        multiyear: 2018,
        number_markers: true,
        county_brush: true,
        shapefile: true,
      },
      texas: {
        number_markers: true,
        county_brush: true,
        contiguity: 2,
        shapefile: true,
        find_unpainted: true,
      },
      utah: {
        number_markers: true,
        county_brush: true,
        native_american: true,
        shapefile: true,
        // find_unpainted: true,
      },
      vermont: {
        number_markers: true,
        county_brush: true,
        multiyear: 2018,
        shapefile: true,
        // find_unpainted: true,
      },
      virginia: {
        number_markers: true,
        county_brush: true,
        // native_american: true,
        coalition: true,
        shapefile: true,
        // find_unpainted: true,
      },
        vabeach: {
          coalition: true,
          multiyear: 2018,
          number_markers: true,
          // find_unpainted: true,
        },
      washington: {
        number_markers: true,
        county_brush: true,
        native_american: true,
        shapefile: true,
        find_unpainted: true,
      },
      westvirginia: {
        multiyear: 2018,
        number_markers: true,
        county_brush: true,
        shapefile: true,
        find_unpainted: true,
      },
      wisconsin: {
        number_markers: true,
        county_brush: true,
        native_american: true,
        shapefile: true,
        screenshot: true,
        find_unpainted: true,
        contiguity: true,
      },
        wisconsin2020: {
          number_markers: true,
          county_brush: true,
          native_american: true,
          shapefile: true,
          screenshot: true,
          find_unpainted: true,
          contiguity: true,
        },
      wyoming: {
        multiyear: 2018,
        native_american: true,
        number_markers: true,
      }
  };
  return status[id] || {};
}
