# Introduction to Districtr-EDA

The Districtr-EDA repo was a project by [@lieuzhenghong] with [@gabe]
to calculate contiguity and cut edges for both districtr and GerryChain
applications at MGGG from the Summer of 2020. Much of the functions beyond
congiguity and cut edges were written by [@mapmeld] who maintains it
with [@jenni-niels]. This is hosted as a flask application (lightweight
Python webframework), on Python Anywhere. This will soon migrate to Amazon-AWS.

## Routes

Currently, the following routes are available to POST queries to. These pair of
functions return JSONs that Districtr can use for all kinds of purposes.

- /vra
- /demographics
- /shp
- /geojson
- /picture2
- /picture
- /, for contiguity 
- /findBBox
- /findCenter
- /contigv2
- /unassigned
- /debug...

//mggg.pythonanywhere.com/
