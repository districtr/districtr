
import json
import glob

"""
Grabs the name of each pattern in our set of PNG patters, maps it to its
filepath, and spits it to JSON.
"""

patterns = {}

for f in glob.glob("converted-pngs/*.png"):
    root = f.split(".")[0].split("/")[1]
    patterns[root] = f"/assets/patterns/{f}"

with open("./patterns.json", "w") as ff:
    json.dump(patterns, ff)

