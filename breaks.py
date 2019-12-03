# pip install jenkspy requests
import json
import jenkspy
import requests

# list of MapBox IDs
communities = [
    #"chicago_community_areas",
    #"ma_precincts_02_10",
    "ma_precincts_12_16",
    #"chicago_precincts"
]
public_key = "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g"

# relative path to Districtr response.json
browser_reference = json.loads(open('./assets/data/response.json', 'r').read())

for comm in communities:
    # find variables used with this community map + unit type
    for mod in browser_reference:
        for unit in mod["units"]:
            if unit["tilesets"][0]["source"]["url"] == "mapbox://districtr." + comm:
                columnSet = unit["columnSets"]
                break
    if columnSet is None:
        print("did not find matching map / units for " + comm)
        quit()

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
                        percent_values_for_var[subvar].append(
                            f["properties"][subvar]
                            /
                            f["properties"][total_for_percent[subvar]]
                        )

            print(str(x) + "," + str(y) + " | total unique units found: " + str(len(seen_ids)))
            # if (len(local_info["features"]) > 0):
            #     print(values_for_var)
            #     quit()

    # output breaks for this community
    print(comm)
    for varsource in [total_values_for_var, percent_values_for_var]:
        for var in varsource.keys():
            print(var + ":")
            calc_breaks = jenkspy.jenks_breaks(varsource[var], nb_class=5)
            breaks = []
            for b in calc_breaks:
                breaks.append(round(b, 4))
            print(breaks)
