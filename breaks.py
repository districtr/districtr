# pip install jenkspy pyshp requests
import json
import jenkspy
import requests
import shapefile

# list of MapBox IDs
web_communities = [
    # "austin_blocks",
    # "islip_blocks",
    # "lowell_blocks",
    # "ma_towns",
    # "philadelphia_blocks",
    # "santa_clara_blocks",
    # "adams_wa_precincts18",
    # "adams_wa_blocks",
    # "yakima_wa_precincts12",
    # "yakima_wa_blocks",
    # "little_rock_blocks",
    # "chicago_community_areas",

    # Are both MA precinct map/eras referring to same ranges?
    #"chicago_precincts"

    # "mississippi_block_groups"
]

shp_communities = [
    ## [name of mapbox layer, name of shapefile in parent directory]
    # ["alaska_precincts", "alaska_precincts"],
    # ["colorado_precincts", "co_precincts"],
    # ["iowa_counties", "ia_counties"],
    # ["georgia_precincts", "GA_precincts16"],
    # ["maryland_precincts", "MD_precincts"],
    # ["michigan_precincts", "MI_precincts"],
    # ["minnesota_precincts", "mn_16"],
    # -- not precincts, did web scan ["mississippi_block_groups", "ms_"],
    # ["ma_precincts_12_16", "MA_precincts12_16"],
    ## VAP missing here? ["ma_precincts_02_10", "MA_precincts_0210"],

    # ["missouri_precincts", "MO_vtds"],
    # ["new_mexico_precincts", "new_mexico_precincts"],
    # ["nc_precincts", "NC_VTD"],
    # ["pennsylvania_precincts", "PA_VTD_PLANS"],
    # ["texas_precincts", "TX_vtds"],
    # ["vermont_towns", "VT_town_results"],
    # ["wisconsin_wards", "WI_ltsb_corrected_final"],
    # ["virginia_precincts", "VA_precincts"],
    # ["rhode_island_precincts", "RI_precincts"],
    # ["providence_ri_blocks", "Providence_blocks"],
    # ["utah_precincts", "UT_precincts"],
    # ["oregon_precincts", "OR_precincts"],
    ["ohio_precincts", "OH_precincts"],
    ["oklahoma_precincts", "OK_precincts"]
]
public_key = "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g"

# relative path to Districtr response.json
browser_reference = json.loads(open('./assets/data/response.json', 'r').read())

def get_column_set(comm):
    # find variables used with this community map + unit type
    columnSet = None
    for mod in browser_reference:
        for unit in mod["units"]:
            if unit["tilesets"][0]["source"]["url"] == "mapbox://districtr." + comm:
                columnSet = unit["columnSets"]
                break
    if columnSet is None:
        print("did not find matching map / units for " + comm)
        quit()
    return columnSet

def output_stuff(comm, total_values_for_var, percent_values_for_var):
    print(comm)
    for varsource in [total_values_for_var, percent_values_for_var]:
        for var in varsource.keys():
            print(var + ":")
            calc_breaks = jenkspy.jenks_breaks(varsource[var], nb_class=5)
            breaks = []
            for b in calc_breaks:
                breaks.append(round(b, 4))
            print('"breaks": ' + str(breaks))

for shpinfo in shp_communities:
    comm = shpinfo[0]
    columnSet = get_column_set(comm)
    total_values_for_var = {}
    percent_values_for_var = {}
    total_for_percent = {}
    for demo_type in columnSet:
        if "total" in demo_type:
            total_values_for_var[demo_type["total"]["key"]] = []
            for subgroup in demo_type["subgroups"]:
                percent_values_for_var[subgroup["key"]] = []
                total_for_percent[subgroup["key"]] = demo_type["total"]["key"]

    # gj = json.loads(open("../" + shpinfo[1] + "/" + shpinfo[1] + ".geojson", "r").read())
    # features = gj["features"]
    # for feat in features:
    #     f = feat["properties"]

    sf = shapefile.Reader("../" + shpinfo[1] + "/" + shpinfo[1] + ".geojson")
    for f in sf.records():
        # print(f)

        for var in total_values_for_var.keys():
            total_values_for_var[var].append(int(f[var]))
        for subvar in percent_values_for_var.keys():
            if f[total_for_percent[subvar]] == 0:
                percent_values_for_var[subvar].append(0)
            else:
                percent_values_for_var[subvar].append(
                    f[subvar]
                    /
                    f[total_for_percent[subvar]]
                )
    output_stuff(comm, total_values_for_var, percent_values_for_var)

for comm in web_communities:
    columnSet = get_column_set(comm)

    # separate out count and percent variables, prepare to record values
    total_values_for_var = {}
    percent_values_for_var = {}
    total_for_percent = {}
    for demo_type in columnSet:
        if "total" in demo_type:
            total_values_for_var[demo_type["total"]["key"]] = []
            for subgroup in demo_type["subgroups"]:
                percent_values_for_var[subgroup["key"]] = []
                total_for_percent[subgroup["key"]] = demo_type["total"]["key"]
    # print(percent_values_for_var)
    # print(total_values_for_var)

    # layer = layer_info["vector_layers"][0]
    # vars = layer["fields"].keys()
    # for var in vars:
    #     if
    #         percent_values_for_var[var] = []
    #     elif
    #         total_values_for_var[]

    # get the bounds for this map
    layer_info = requests.get("https://api.mapbox.com/v4/districtr." + comm + ".json?access_token=" + public_key).json()
    bounds = layer_info["bounds"]
    xmin = bounds[0]
    ymin = bounds[1]
    xmax = bounds[2]
    ymax = bounds[3]

    # do 16x16 queries within the map bounds
    # collect as many unique precinct/blocks as possible
    # record their values so we can make breaks
    seen_ids = []
    grid_size = 15
    for x in range(0, grid_size):
        for y in range(0, grid_size):
            lng = str(xmin + (xmax - xmin) * (x / grid_size))
            lat = str(ymin + (ymax - ymin) * (y / grid_size))
            local_info = requests.get("https://api.mapbox.com/v4/districtr." + comm + "/tilequery/" + lng + "," + lat + ".json?access_token=" + public_key + "&radius=20000&limit=50").json()
            # print(local_info)
            for f in local_info["features"]:
                if f["id"] not in seen_ids:
                    seen_ids.append(f["id"])
                    for var in total_values_for_var.keys():
                        total_values_for_var[var].append(int(f["properties"][var]))
                    for subvar in percent_values_for_var.keys():
                        if f["properties"][total_for_percent[subvar]] == 0:
                            percent_values_for_var[subvar].append(0)
                        else:
                            percent_values_for_var[subvar].append(
                                f["properties"][subvar]
                                /
                                f["properties"][total_for_percent[subvar]]
                            )

            print(str(x) + "," + str(y) + " | total unique units found: " + str(len(seen_ids)))
            # if (len(local_info["features"]) > 0):
            #     print(values_for_var)
            #     quit()

    output_stuff(comm, total_values_for_var, percent_values_for_var)
