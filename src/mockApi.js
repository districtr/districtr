export const MA_towns = {
    name: "Massachusetts (Towns)",
    source: {
        type: "vector",
        url: "mapbox://districtr.aaxemxed"
    },
    sourceLayer: "FinalMass-atlf9p",
    properties: {
        population: {
            key: "POP2010",
            total: 6.54763e6,
            min: 75,
            max: 617594
        }
    },
    bounds: [[-74, 41.2], [-68, 43]],
    numberOfParts: 9,
    elections: [
        {
            id: "PRES00",
            year: 2000,
            race: "Presidential",
            partiesToColumns: {
                Democratic: "Pres00D",
                Republican: "Pres00R"
            }
        },
        {
            id: "SEN00",
            year: 2000,
            race: "Senate",
            partiesToColumns: {
                Democratic: "Sen00D",
                Republican: "Sen00R"
            }
        },
        {
            id: "SEN02",
            year: 2002,
            race: "Senate",
            partiesToColumns: {
                Democratic: "Sen02D",
                Republican: "Sen02R"
            }
        },
        {
            id: "PRES04",
            year: 2004,
            race: "Presidential",
            partiesToColumns: {
                Democratic: "Pres04D",
                Republican: "Pres04R"
            }
        },
        {
            id: "SEN06",
            year: 2006,
            race: "Senate",
            partiesToColumns: {
                Democratic: "Sen06D",
                Republican: "Sen06R"
            }
        },
        {
            id: "PRES08",
            year: 2008,
            race: "Presidential",
            partiesToColumns: {
                Democratic: "Pres08D",
                Republican: "Pres08R"
            }
        },
        {
            id: "SEN08",
            year: 2008,
            race: "Senate",
            partiesToColumns: {
                Democratic: "Sen08D",
                Republican: "Sen08R"
            }
        },
        {
            id: "SEN10",
            year: 2010,
            race: "Senate",
            partiesToColumns: {
                Democratic: "Sen10D",
                Republican: "Sen10R"
            }
        },
        {
            id: "PRES12",
            year: 2012,
            race: "Presidential",
            partiesToColumns: {
                Democratic: "Pres12D",
                Republican: "Pres12R"
            }
        },

        {
            id: "SEN12",
            year: 2012,
            race: "Senate",
            partiesToColumns: {
                Democratic: "Sen12D",
                Republican: "Sen12R"
            }
        },
        {
            id: "SEN13",
            year: 2013,
            race: "Senate",
            partiesToColumns: {
                Democratic: "Sen13D",
                Republican: "Sen13R"
            }
        },
        {
            id: "SEN14",
            year: 2014,
            race: "Senate",
            partiesToColumns: {
                Democratic: "Sen14D",
                Republican: "Sen14R"
            }
        },
        {
            id: "PRES16",
            year: 2016,
            race: "Presidential",
            partiesToColumns: {
                Democratic: "Pres16D",
                Republican: "Pres16R"
            }
        }
    ]
};

export const MA_precincts = {
    name: "Massachusetts (Precincts)",
    source: {
        type: "vector",
        url: "mapbox://districtr.btydwuhf"
    },
    sourceLayer: "MA_precincts_correct_types-8f0w6d",
    properties: {
        population: {
            key: "POP10",
            total: 6547816,
            min: 75,
            max: 10172
        }
    },
    bounds: [[-74, 41.2], [-68, 43]],
    numberOfParts: 9,
    elections: [
        {
            id: "SEN12",
            year: 2012,
            race: "Senate",
            partiesToColumns: {
                Democratic: "SEN12D",
                Republican: "SEN12R"
            }
        },
        {
            id: "PRES12",
            year: 2012,
            race: "Presidential",
            partiesToColumns: {
                Democratic: "PRES12D",
                Republican: "PRES12R"
            }
        },
        {
            id: "SEN13",
            year: 2013,
            race: "Senate",
            partiesToColumns: {
                Democratic: "SEN13D",
                Republican: "SEN13R"
            }
        },
        {
            id: "SEN14",
            year: 2014,
            race: "Senate",
            partiesToColumns: {
                Democratic: "SEN14D",
                Republican: "SEN14R"
            }
        },
        {
            id: "PRES16",
            year: 2016,
            race: "Presidential",
            partiesToColumns: {
                Democratic: "PRES16D",
                Republican: "PRES16R"
            }
        }
    ]
};

export const alaska = {
    name: "Alaska (Precincts)",
    source: {
        type: "vector",
        url: "mapbox://districtr.5x4innca"
    },
    sourceLayer: "alaska-ce2eim",
    properties: {
        population: {
            key: "POPULATION",
            total: 710231,
            min: 44,
            max: 7994
        }
    },
    bounds: [[-175.0, 51.2], [-130.0, 71.4]],
    numberOfParts: 20,
    elections: [
        {
            id: "Pres",
            year: 2016,
            race: "Presidential",
            partiesToColumns: {
                Democratic: "D-Pres Vot",
                Republican: "R-Pres Vot"
            }
        }
    ]
};

export const lowell = {
    name: "Lowell, MA (Blocks)",
    source: {
        type: "vector",
        url: "mapbox://districtr.6q5m5cw7"
    },
    sourceLayer: "lowell-c2pah6",
    properties: {
        population: {
            key: "population",
            total: 101867,
            min: 0,
            max: 1469
        }
    },
    bounds: [[-71.35, 42.59], [-71.25, 42.69]],
    numberOfParts: 9,
    elections: []
};

const places = [MA_precincts, MA_towns, alaska, lowell];

export default places;
