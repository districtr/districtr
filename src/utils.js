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
  bbox = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY,];
  return coords.reduce(function (prev, coord) {
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
    coords = gj.coordinates.reduce(function (dump, part) {
      return dump.concat(part);
    }, []);
  } else if (gj.type == 'MultiPolygon') {
    coords = gj.coordinates.reduce(function (dump, poly) {
      return dump.concat(poly.reduce(function (points, part) {
        return points.concat(part);
      }, []));
    }, []);
  } else if (gj.type == 'Feature') {
    coords = getCoordinatesDump(gj.geometry);
  } else if (gj.type == 'GeometryCollection') {
    coords = gj.geometries.reduce(function (dump, g) {
      return dump.concat(getCoordinatesDump(g));
    }, []);
  } else if (gj.type == 'FeatureCollection') {
    coords = gj.features.reduce(function (dump, f) {
      return dump.concat(getCoordinatesDump(f));
    }, []);
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
  districtofcolumbia: 11,
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
  newhampshire: 33,
  "new jersey": 34,
  new_jersey: 34,
  newjersey: 34,
  "new mexico": 35,
  new_mexico: 35,
  newmexico: 35,
  "new york": 36,
  new_york: 36,
  newyork: 36,
  "north carolina": 37,
  north_carolina: 37,
  northcarolina: 37,
  nc: 37,
  "north dakota": 38,
  north_dakota: 38,
  northdakota: 38,
  ohio: 39,
  oklahoma: 40,
  oregon: 41,
  pennsylvania: 42,
  "rhode island": 44,
  rhode_island: 44,
  rhodeisland: 44,
  "south carolina": 45,
  southcarolina: 45,
  south_carolina: 45,
  "south dakota": 46,
  south_dakota: 46,
  southdakota: 46,
  tennessee: 47,
  texas: 48,
  utah: 49,
  vermont: 50,
  virginia: 51,
  washington: 53,
  "west virginia": 54,
  westvirginia: 55,
  west_virginia: 54,
  wisconsin: 55,
  wyoming: 56,
  "puerto rico": 72,
  puertorico: 72,
  puerto_rico: 72
};

export function spatial_abilities(id) {
  const status = {
    alabama: {
      native_american: true,
      number_markers: true,
      county_brush: true,
      shapefile: true,
      find_unpainted: true,
    },
    alaska: {
      number_markers: true,
      native_american: true,
      shapefile: true,
      school_districts: true,
      municipalities: true,
      current_districts: true,
      portal: {
        endpoint: 'https://www.akredistrict.org/map-comment',
      },
    },
    alaska_blocks: {
      coalition: false,
      school_districts: true,
      municipalities: true,
      current_districts: true,
      portal: {
        endpoint: 'https://www.akredistrict.org/map-comment',
        saveredirect: 'www.akredistrict.org/create/edit.html',
      },
    },
    arizona: {
      number_markers: true,
      county_brush: true,
      native_american: true,
      shapefile: true,
      // find_unpainted: true,
    },
    maricopa: {
      native_american: true,
      number_markers: true,
    },
    nwaz: {
      native_american: true,
      number_markers: true,
    },
    seaz: {
      native_american: true,
      number_markers: true,
    },
    mesaaz: {
      native_american: true,
      number_markers: true,
      border: true,
      sideload: true,
    },
    phoenix: {
      native_american: true,
      number_markers: true,
      border: true,
    },
    yuma: {
      native_american: true,
      number_markers: true,
    },
    arkansas: {
      multiyear: 2018,
      number_markers: true,
      county_brush: true,
      shapefile: true,
      find_unpainted: true,
    },
    california: {
      number_markers: true,
      native_american: true,
      county_brush: true,
      shapefile: true,
      sideload: true,
      // find_unpainted: true,
    },
    pasorobles: {
      number_markers: true,
      border: true,
      shapefile: true,
    },
    sacramento: {
      coalition: false,
      shapefile: true,
      number_markers: true,
      border: true,
      // divisor: 1000,
    },
    ca_sonoma: {
      coalition: false,
      border: true,
      shapefile: true,
      number_markers: true,
    },
    ca_pasadena: {
      coalition: false,
      border: true,
    },
    ca_goleta: {
      coalition: false,
      border: true,
    },
    ca_santabarbara: {
      coalition: false,
      border: true,
    },
    sanluiso: {
      coalition: false,
      number_markers: true,
      shapefile: true,
      border: true,
      municipalities: true,
      // sideload: true,
    },
    ccsanitation: {
      // multiyear: 2018,
      shapefile: true,
    },
    ccsanitation2: {
      multiyear: 2018,
      shapefile: true,
      border: true,
    },
    santa_clara: {
      border: true,
    },
    napa: {
      number_markers: true,
      border: true,
    },
    napaschools: {
      number_markers: true,
      coalition: false,
      border: true,
    },
    chicago: {
      number_markers: true,
      multiyear: 2019,
      border: true,
      parties: [
        "Rahm Emanuel",
        "Jesus \u201cChuy\u201d Garc\u00eda",
        "Lori Lightfoot",
        "Toni Preckwinkle",
      ]
    },
    colorado: {
      number_markers: true,
      county_brush: true,
      native_american: true,
      contiguity: 2,
      shapefile: true,
      find_unpainted: true,
      load_coi: false,
    },
    connecticut: {
      county_brush: true,
      native_american: true,
      number_markers: true,
      contiguity: 2,
      shapefile: true,
      find_unpainted: true,
      load_coi: false,
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
      sideload: true,
      portal: {
        endpoint: "https://portal.florida-mapping.org",
      },
    },
    miamifl: {
      number_markers: true,
      neighborhoods: true,
      border: true,
    },
    miamidade: {
      multiyear: 2018,
      number_markers: true,
      neighborhoods: true,
    },
    fl_hills: {
      multiyear: 2019,
      number_markers: true,
      shapefile: true,
    },
    fl_orange: {
      multiyear: 2019,
      number_markers: true,
      shapefile: true,
    },
    fl_osceola: {
      number_markers: true,
      shapefile: true,
    },
    orlando: {
      number_markers: true,
      shapefile: true,
      border: true,
    },
    tampa: {
      number_markers: true,
      shapefile: true,
      border: true,
    },
    kissimmee: {
      number_markers: true,
      shapefile: true,
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
      contiguity: 2,
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
      load_coi: false,
      school_districts: true,
    },
    iowa: {
      number_markers: true,
      contiguity: 2,
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
      find_unpainted: true,
      load_coi: false,
    },
    la_vra: {
      native_american: true,
      vra_effectiveness: true,
      county_brush: true, // lakes
      number_markers: false, // need different ids that louisiana precincts need to update server
    },
    batonrouge: {
      number_markers: true,
      shapefile: true,
      border: true,
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
      absentee: true,
      shapefile: true,
      find_unpainted: true,
      load_coi: false,
    },
    baltimore: {
      border: true,
      number_markers: true,
      shapefile: true,
      contiguity: 2,
    },
    ma: {
      number_markers: true,
      shapefile: true,
      // find_unpainted: true,
      portal: {
        endpoint: 'https://www.massachusetts-mapping.org',
      },
    },
    ma_vra: {
      // number_markers: true,
      vra_effectiveness: true,
      // shapefile: true,
      // find_unpainted: true,
    },
    lowell: {
      neighborhoods: true,
      contiguity: 2,
      number_markers: true,
      shapefile: true,
      coalition: false,
      border: true,
      // find_unpainted: true,
    },
    massachusetts: {
      portal: {
        endpoint: 'https://www.massachusetts-mapping.org',
      },
    },
    michigan: {
      number_markers: true,
      native_american: true,
      county_brush: true,
      shapefile: true,
      find_unpainted: true,
      current_districts: true,
      school_districts: true,
      municipalities: true,
      contiguity: 2,
      portal: {
        endpoint: 'https://www.michigan-mapping.org',
      },
    },
    minnesota: {
      number_markers: true,
      county_brush: true,
      native_american: true,
      shapefile: true,
      find_unpainted: true,
    },
    mn2020acs: {
      number_markers: true,
      county_brush: true,
      native_american: true,
      shapefile: true,
      find_unpainted: true,
    },
    olmsted: {
      number_markers: true,
      border: true,
    },
    rochestermn: {
      number_markers: true,
      border: true,
    },
    washington_mn: {
      border: true,
      number_markers: true,
      shapefile: true,
    },
    stlouis_mn: {
      border: true,
      number_markers: true,
      shapefile: true,
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
      load_coi: false,
      // find_unpainted: true,
      school_districts: true,
      portal: {
        endpoint: "https://portal.missouri-mapping.org",
      },
    },
    montana: {
      multiyear: 2018,
      native_american: true,
      number_markers: true,
      shapefile: true,
      find_unpainted: true,
      county_brush: true,
    },
    nebraska: {
      // multiyear: 2018,
      // number_markers: true,
      native_american: true,
      county_brush: true,
      absentee: true,
      shapefile: true,
      load_coi: false,
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
      multiyear: 2018,
      // find_unpainted: true,
      school_districts: true
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
      shapefile: true,
      find_unpainted: true
    },
    new_mexico_portal: {
      number_markers: true,
      county_brush: true,
      native_american: true,
      contiguity: 2,
      current_districts: true,
      shapefile: true,
      find_unpainted: true,
      election_history: false,
      portal: {
        endpoint: 'https://portal.newmexico-mapping.org',
      },
    },
    new_mexico_bg: {
      native_american: true,
      shapefile: true,
      current_districts: true,
      county_brush: true,
      // find_unpainted: true,
      portal: {
        endpoint: 'https://portal.newmexico-mapping.org',
      },
    },
    santafe: {
      number_markers: true,
      contiguity: 2,
      shapefile: true,
      // find_unpainted: true,
    },
    newyork: {
      number_markers: true,
      county_brush: true,
      native_american: true,
      shapefile: true,
      // find_unpainted: true,
    },
    northcarolina: {
      number_markers: true,
      county_brush: true,
      native_american: true,
      coi2: true,
      current_districts: true,
      shapefile: true,
      find_unpainted: true,
      coalition: false,
    },
    forsyth_nc: {
      contiguity: 2,
      shapefile: true,
    },
    buncombe: {
      contiguity: 2,
      shapefile: true,
      number_markers: true,
      border: true,
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
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
      school_districts: true,
      current_districts: true
    },
    ohcentral: {
      multiyear: 2019,
      number_markers: true,
      shapefile: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    ohakron: {
      multiyear: 2019,
      number_markers: true,
      shapefile: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    ohcin: {
      multiyear: 2019,
      number_markers: true,
      shapefile: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    ohcle: {
      multiyear: 2019,
      number_markers: true,
      shapefile: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    ohse: {
      multiyear: 2019,
      number_markers: true,
      shapefile: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    ohtoledo: {
      multiyear: 2019,
      number_markers: true,
      shapefile: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    akroncanton: {
      number_markers: true,
      shapefile: true,
      border: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    cincinnati: {
      number_markers: true,
      shapefile: true,
      border: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    clevelandeuclid: {
      number_markers: true,
      shapefile: true,
      border: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    columbus: {
      number_markers: true,
      shapefile: true,
      border: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    dayton: {
      number_markers: true,
      shapefile: true,
      border: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    limaoh: {
      number_markers: true,
      shapefile: true,
      border: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    mansfield: {
      number_markers: true,
      shapefile: true,
      border: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    portsmouthoh: {
      number_markers: true,
      shapefile: true,
      border: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    toledo: {
      number_markers: true,
      shapefile: true,
      border: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    youngstown: {
      number_markers: true,
      shapefile: true,
      border: true,
      portal: {
        endpoint: 'https://portal.ohio-mapping.org',
      },
    },
    oklahoma: {
      number_markers: true,
      native_american: true,
      county_brush: true,
      contiguity: 2,
      shapefile: true,
      find_unpainted: true,
    },
    ontarioca: {
      number_markers: true,
      border: true,
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
      border: true,
    },
    pennsylvania: {
      number_markers: true,
      county_brush: true,
      shapefile: true,
      find_unpainted: true,
      sideload: true,
      load_coi: false,
      contiguity: 2,
      portal: {
        endpoint: "https://portal.pennsylvania-mapping.org",
      },
    },
    philadelphia: {
      number_markers: true,
      contiguity: 2,
      find_unpainted: true,
      border: true,
    },
    puertorico: {
      number_markers: true,
      county_brush: true,
      shapefile: true,
      find_unpainted: true,
    },
    puertorico_prec: {
      number_markers: true,
      parties: ["Nuevo Progresista", "Popular Democrático", "Nuevo Progresista", "Popular Democrático"],
      shapefile: true,
      // find_unpainted: true,
    },
    rhode_island: {
      number_markers: true,
      shapefile: true,
    },
    providence_ri: {
      border: true,
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
      sideload: true,
      portal: {
        endpoint: "https://portal.texas-mapping.org",
      },
    },
    tx_vra: {
      vra_effectiveness: true,
      county_brush: true,
      number_markers: true,
    },
    austin: {
      border: true,
    },
    fortworth: {
      border: true,
    },
    houston: {
      border: true,
      number_markers: true,
      shapefile: true,
      multiyear: 2019,
    },
    elpasotx: {
      border: true,
      number_markers: true,
      shapefile: true,
    },
    utah: {
      number_markers: true,
      county_brush: true,
      native_american: true,
      shapefile: true,
      // find_unpainted: true,
      portal: {
        endpoint: 'https://portal.utah-mapping.org',
      },
    },
      'grand_county_2': {
        portal: {
          endpoint: 'https://portal.utah-mapping.org',
        },
        shapefile: true,
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
      shapefile: true,
      // find_unpainted: true,
      load_coi: false,
      portal: {
        endpoint: 'https://portal.virginia-mapping.org',
      },
    },
    vabeach: {
      multiyear: 2018,
      number_markers: true,
      border: true,
      // find_unpainted: true,
    },
    washington: {
      number_markers: true,
      county_brush: true,
      native_american: true,
      shapefile: true,
      find_unpainted: true,
      contiguity: 2,
    },
    yakima_wa: {
      coalition: false,
    },
    kingcountywa: {
      border: true,
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
      find_unpainted: true,
      current_districts: true,
      school_districts: true,
      municipalities: true,
      contiguity: 2,
      portal: {
        endpoint: 'https://portal.wisconsin-mapping.org',
      },
      sideload: true,
    },
    wisconsin2020: {
      number_markers: true,
      county_brush: true,
      native_american: true,
      shapefile: true,
      find_unpainted: true,
      current_districts: true,
      school_districts: true,
      municipalities: true,
      contiguity: 2,
      portal: {
        endpoint: 'https://portal.wisconsin-mapping.org',
      },
      sideload: true,
    },
    wisco2019acs: {
      number_markers: true,
      county_brush: true,
      native_american: true,
      shapefile: true,
      find_unpainted: true,
      current_districts: true,
      school_districts: true,
      municipalities: true,
      contiguity: 2,
      portal: {
        endpoint: 'https://portal.wisconsin-mapping.org',
      },
      sideload: true,
    },
    wyoming: {
      multiyear: 2018,
      native_american: true,
      number_markers: true,
    }
  };
  return status[id] || {};
}

export function nested(st) {
  return [
    'alaska',
    'illinois',
    'iowa',
    'minnesota',
    'montana',
    'ohio',
    'oregon',
    'southdakota',
    'washington',
    'wisconsin'].includes(st);
}

export function one_cd(st) {
  return [
    'alaska',
    'alaska_blocks',
    'delaware',
    'montana',
    'northdakota',
    'southdakota',
    'vermont',
    'wyoming'].includes(st)
}