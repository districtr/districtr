# An Inventory of Contributions

As of the arbitrary date Tue., Jun. 1, 2021, it has been
[@mapmeld] who has led the maintenance of districtr since
September of 2019, extending the foundation built by
[@maxhully].

By exploring the contributions and philosophies of each
contributor, we get a full picture of how the parts of districtr fit
together with themselves and the philosophy of their creators.

<img src="../pics/timeline.png" width=75%>

## Genesis

Districtr began on Sun., Aug. 22, 2018, in the runup to the midterm
elections by [@maxhully]. We credit most of the following innovations to
his efforts. 

It took two weeks after its genesis in github for Max to start his
initial experiments. The first `index.js` was created on Thu., Sept. 6
when districtr was made a node package. It took another few weeks for
the first components of districtr to congeal.

Mon., Oct. 22 is a big day as it led to the filling out of `index.html`,
his first experiments with mapbox-gl and marked the start of a
productive week. By Halloween, Max had begun working on the following
ideas. First, mapbox-gl components such as...
- `map.js`
- `Layer`
- `Brush`
- `Hover`
- Color rules for districtr assignments
- Sass for display

These map elements would eventually move to the `/map` folder by
mid-November as these elements grew in power. The first elements of the
 `Toolbar` were also created later this week, including the first
 instances of `Tool`, `Toolbar` and tools...
- `BrushTool`
- `EraserTool`
- `PanTool` ,
and chart and info features...
- `PopulationBarChart`, with initial `Tooltip`
- `ChartList`
- `ElectionResults` 
- `PopulationDeviation` 
- `UnassignedPopulation`
- `Tabs`

Work continued on various UI options an overlay containers that we're
familiar with throughout November culminating in the creation of the
`/components` folder that was created the day after Thanksgiving. This
includes...
- `PartisanOverlay`
- `OptionsContainer` 
- `PartisanOverlayContainer`
- `PlacesList`
- `Toggle`, originally `LayerToggle`

Vital models were also created during this time that we used today to
analyze data in preparation for the first big addition of state and
election data.
- `Election`
- `Part`
- `Population`
- `State`
- `Tally`

## Arriving at and extending the First Demo

The next big sign post in the history of Districtr a commit titled
["Everything's ready for the demo!"], late in the day Mon. Feb. 4, 2019.
All winter, real data was added and after the demo, features were
refined.

In the wintertime, real data was added in the `src/data` folder that
would turn into the `assets` folder, created on Tues. Dec. 4, 2018.

> The first instance of the MGGG and Districtr logos appear to be from
Wed., Jan. 9, 2019 in what was then the static folder. They were later
moved to assets. An updated logo preimiered on Thu. May 14, 2021.

Building his mastery of mapbox, Max would devlop more features for
districtr inlcuding...

- `DemographicOverlay`
- `DemographicOverlayContainer`
- Refinement of JSON import export originally begun in Early Dec. with
`PlanUploader`
- the layer adder.
- Color Scales
- `Select` 

On Fri., Jan. 11, districtr had grown enough to warrant multiple views.
A folder/submodule was now  created together with the following... 
- new.js
- index.js
- edit.js

The next week, the User Interface was refined and more features were
added, culminating in the addition of new tabs and sections. Created
at this time was... 
- `UIStateStore`
- `Reducers`
- `NumericalColumn`
- The unassigned feature was renamed into `HighlightUnassigned` 
- `LayersTab` originally part of edit, was made its own file
- The `Parameter` was renamed from `LayerListItem`.
- The `Tooltip` was completed.

Finally, in preparation for the early Feb. Demo, the last few bits of
user services and data display were collected including...

- A register page and logins, to be deprecated later
- A form to request a new module, still in place
- The `routes.js` file that allows for talking with a server
- The `DataTable`, its implementation through `DemographicsTable` and
its home `Demographics Tab`. 
- Initial demo `Landmarks` abilities.
- The UI `RevealSection` 
- The `Evaluation` Tab

Finally, a reorganization takes place around Fri., Feb. 1 where
all `Toolbar` elements, the `ElectionResultsSection` and the
`RacialBalanceSection` is folded into `/src/components`. 

At this point, districtr, filled with real data and rich with features,
was ready to demo. 

Around this time, Anthony, [@apizzimenti] appears to help Max prepare
for the first districtr demo. On Tue. Jan. 15, he writes the api that
allows users to log in and out of the app. The next week, he loads test
populations. His big contribution here is the creation of the
`InspectTool` on Sat., Jan. 25. He continued to help work on the api
through February.

Typically involved with the more research and Gerrychain side of the 
MGGG laboratory, Anthony has returned to help in the Spring of 2021
processing data for Wisconsin, Minnesota and the contribution of
language for public-facing custom portals.

### Lessons From the Demo

In anticipation of the addition of even more data, `src/data` is renamed
`src/assets`, a development server using Gulp is created,
`MultimemberDistricts` is implemented thanks to work offered by Chicago,
and the first `lib.js` file is created with functions
`assignLoadedUnits(...)` and `assignUnitsAsTheyLoad(...)` which should
turn into its own folder down the line.

## Max on a Roll

As the Spring and Summer of 2019 unfolded, real data and new features
were added at a rapid pace, together with maintaining and fixing bugs on
districtr's core features. Thanks to our partnerships we began to add
data and landing pages for Chicago, Iowa, Michicagn, Alaska, Rhode
Island and Washington State. As our service areas grew, Max built out...

- the `PlaceMap` on Tue., Apr. 9
- and the first place specific html redirects, Wed. Apr. 17

We also began to provide more functionality, particularly with
Communities of Interest, and plugins with which to organize those
features.

- Plugins introduced around Tue.-Wed., Apr. 23-24
- The CommunityTab and coi functionality- extended from `Landmarks`
built in February, at the same time.
- From the original `InspectTool`, `HorizontalBarChart` and
`TooltipContent` implemented for landmarks and communities on Mon.
Apr. 29

Further features built out in May include...
- `Dropdown Sections`
- Futrther community identification 
- The ability to export to CSV
- District label icons
- The mapbox `geocoder`

And finally, the ability to load from a URL by July. 

### A Little Help from my Friends

Borrowing talent from the research side of MGGG, [@bsuwal] added some
UI options for Landmarks in June, [@chriskgernon] wrote the first user
guide in July and [@amybecker] began to use districtr to test out
Yakima, WA Plans.

While not explicitly mentioned in the districtr codebase, we cannot
understate the contribution of lead geographer Ruth Buck, [@RKBuck1],
who built out `mggg-states`, our repository of census and precinct
shapefiles that continues to feed this project. 

## Passing of the Torch

Max Hully arrived at MGGG in August of 2018 and by the Summer of 2019,
was preparing for an opportunity to continue his career in 
redistricting software with Maptitude, by the Caliper Corporation.
At the same time, JN Matthews, [@jenni-niels] was completing their
Computer Science degree at Tufts and Nick Doiron, [@mapmeld] had
returned back to the Boston area after years of social mapping and
consulting.

This transition represents a vital evolution between early and late
stage districtr and it is thanks to Nick and JN's work during this time
and through 2020 that districtr evolved into the tool we're proud of
today.

Max's last commit to the `latest` branch occured on Tue., Sept. 3, 2019.
In preparation for this, he performed a repo clean up submitted as
[pull #68]. In his own commit note, Max describes the changes...
```
* Clean up repo.
Use consistent file-naming conventions.
Use semi-consistent conventions for naming classes and components.
Describe naming conventions in README.
Link to guiding principles.
Add some comments.

* Remove folders to make folder name change work

* Add folders again to make folder name changes work

* Fix Select usage

* Try and fix CI

* Move AboutSection component to its own file.
Fix Select import in AboutSection.

* Fix imports

* Remove select.js to make renaming work

* Add Select.js back in to get renaming to work
```
Much of the current README.md dates from this pull.

By then, through the summer...
- County Boundaries were added on Fri., Jul. 19
- Modules were added for North Carolina and Litlte Rock, AR
- Control Access Headers were created

## Spreading and Strengthening 

Quickly, with support from [@RKBuck1] in the fall of 2019, Nick and JN
would split responsibilities where JN would load and update data and
generate landing pages and Nick would maintain features.

In the Fall of that year...

- [@jenni-niels] and [@mapmeld] worked together to add data and create a
custom page for Lowell, MA 

We credit Nick, [@mapmeld], for...
- creating a way to drag and drop JSON files and accept the reading
of CSV and JSON files,
- Drawing landmark points and polygons
- Making it easier to generate URLs for saved plans, using simple IDs
- Improving user experience with tokens so that the same plan can be
updated in the same session and allow multiple maps in multiple windows
- saving and sharing Plans to the Desktop
- save current progress in browser and save plans to database using 
mongodb
- and print maps to pdf

While JN, [@jenni-niels],  created the prototype local community page
with landing page sections and content for Lowell, MA and Colorado. We
would use their work during this time as the model for the default pages
and custom portals we use today.

### Expanding Nationwide

Throughout 2020, Nick worked on adding features and JN worked on
modifying and updating state pages. A rough timeline for the genesis of
current features are as follows, with the knowledge that they are all
being perfected over time.

- January 2020
   - A legend for Demographic Overlays
- February
   - Number Markers 
   - City Borders
- March
   - Contiguity with help from [@lieuzhenghong]
   - Netlify Lambda Functions
- April
   - Age Histogram Tables
- May
   - Tribal Support Layers
- June
   - Option to Lock Drawn Communities 
   - Income and Rent Overlays
- July
   - Coalition Tools 
- August
   - The option to display Neighborhood Names
- September
   - Event Pages thanks to [@jenni-niels]
   - State pages for all states, Wed. Sept. 16 thanks to [@jenni-niels]
   - Shapefile Export
- October
   - Support for Louisiana Parish names
   - Alternate Populations based on Absentee Voting
   - Zoom to Contiguity

## Professionalizing Districtr

As districtr built up its features, many more localities and
organizations were hoping to use the app for their own commissions and
efforts. For that and many more reasons, Liz Kopecky was added in Nov.
of 2019 to help administer these efforts.

Jamie Atlas, [@AtlasCommaJ] was also brought in November of 2020,
selected due to his fork adding a way to customize the number of
districts in a problem. This was eventually merged into the main branch
of districtr in Jan. 2021.

Throughout the Spring, Jamie has also...
- Increased the maximum number of custom districts and communities to 250
- Generated training resources and user guides
- Created custom events for clients in...
   - Grand County, UT
   - Texas
   - Baltimore, MD
   - Minnesota statewide, Olmsted, Washington, St. Louis and Rochester counties
   - Wisconsin
   - Missouri
- and is supervising new contributors and working on regimes for quality
assurance and testing. 

### VRA

Separate from their responsibilies creating custom portals and assisting
on the MGGG research side, [@jenni-niels] has been spearheading the
ability to analyze districts using Voting Rights Act effectiveness. This
began late December, 2020. To date, VRA is the first server function
calculated using our future AWS server.

### Geographies 

Researcher Heather Rosenfeld, [@heatrose] has served as lead geographer
for both the research and districtr sides of the MGGG laboratory.
Together with Ruth Buck, [@RKBuck1], they are due credit for developing
the methods we use to generate well considered demographic, electoral,
geographic census and precinct data we use. 

## Today's Redistricting Wave

This documentation was prepared during the training of the first of a
large cohort of bright developers and data scientists gearing up to
assist in redistricting efforts all around the country.

As of June, 2021, release of data collected by the decennial census of
2020 has been delayed. What would have been released in April was
released instead in August and September. This effectively compresses
the time for new districts to be proposed, commented on, revised and
enacted for hundreds of statewide, state legislature and county, local
and school districts. The Elections of 2022 are under 18 months way.

Despite this, Jack Descshler, [@jackdeschler], has hit the ground
running starting with his composition of a page that shows which of our
modules carry which features based on
`spatial_abilities`. In just a few months, he has...
-  added fine grain to  UI elements
- quickly revised our modules to reflect new 2020-2030
seat reapportionment allocations released late April, 2021
- added custom features for clients in Wisconsin, Minnesota, Michigan and Ohio
- added functionality for many new types of overlay layers
- and plethora of small fixed all across the platform...
all together with his work improving contiguity graphs for both 
Gerrychain and districtr. 

Oliver Nguyen, [@nerdgear], is tasked with providing fixes to many of
our clients and is currently updating information on many states based
on 2019 ACS data towards the highest quality. He has worked on
updating features for partners in...
- Nebraska
- Miami
- Wisonsin
- Texas
- and Kansas.

Finally, yours truly, [@gomotopia], completed this Story of Districtr
throughout June of 2021, with great joy.

# # 

[Return to Main](../README.md)
- Previous: [The Team](./12team/theteam.md)

[@maxhully]: http://github.com/maxhully
[@mapmeld]:http://github.com/mapmeld
[@jenni-niels]: http://github.com/jenni-niels
[@RKBuck1]: http://github.com/RKBuck1
[@heatrose]: http://github.com/heatrose
[@AtlasCommaJ]: http://github.com/AtlasCommaJ
[@apizzimenti]: http://github.com/apizzimenti
[@ChrisKGernon]: http://github.com/ChrisKGernon
[@lieuzhengong]: http://github.com/lieuzhengong
[@bsuwal]: http://github.com/bsuwal
[@amybecker]: http://github.com/amybecker
[@jackdeschler]: http://github.com/jackdeschler
[@nerdgear]: http://github.com/nerdgear
[@gomotopia]: http://github.com/gomotopia
[@robbie-veglahn]: http://github.com/robbie-veglahn
[@InnovativeInventor]: http://github.com/InnovativeInventor
[@tahentx]: http://github.com/tahentx
[@nguyenm2151]: http://github.com/nguyenm2151
[@phorva01]: http://github.com/phorva01

["Everything's ready for the demo!"]: https://github.com/districtr/districtr/commit/6752d49f808e2197b55940a900ff2dfac48af211
[pull #68]: https://github.com/districtr/districtr/commit/cf1874eeaaa1b2bfc5fed776ce50648aeca5217f

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA
