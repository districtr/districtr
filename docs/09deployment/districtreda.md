# Introduction to Districtr-EDA

The Districtr-EDA repo was a project by [@lieuzhenghong] to calculate
contiguity and cut edges for both districtr and GerryChain applications
at MGGG from the Summer of 2020. Much of the functions beyond
congiguity and cut edges were written by [@mapmeld] who maintains it
with [@AtlasCommaJ] and [@jenni-niels]. This is hosted as a [flask]
application (lightweight Python webframework), on [Python Anywhere].

These functions are currently stored in sister repository
[`districtr/districtr-eda`] and will soon migrate to [Amazon-AWS].

## Routes

Currently, the following routes are available to POST queries to. These
pair of functions return JSONs that Districtr can use for all kinds of
purposes.

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

The current URL for this server is [http://mggg.pythonanywhere.com]

# # 

[Return to Main](../README.md)
- Previous: [Routes](../09deployment/routes.md)
- Next: [Intro to mggg-states](../09deployment/mggg-states.md)
- [Netlify Lambda Functions and MongoDB](../09deployment/mongolambdas.md)
- [Headers and Redirects](../09deployment/headersredirects.md)
- [package.json and npm](../09deployment/package.md)

[@lieuzhenghong]: http://github.com/lieuzhenghong
[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld
[@AtlasCommaJ]: http://github.com/AtlasCommaJ
[@jenni-niels]: http://github.com/jenni-niels

[flask]: https://flask.palletsprojects.com/en/2.0.x/
[Python Anywhere]: https://www.pythonanywhere.com/
[Amazon-AWS]: https://aws.amazon.com/

[http://mggg.pythonanywhere.com]: http://mggg.pythonanywhere.com
[`districtr/districtr-eda`]: https://github.com/districtr/districtr-eda

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA