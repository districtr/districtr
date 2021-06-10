# Communities of Interest

Districtr has two primary modes, one sometimes known as "districtview"
where districts are painted and calculated and "community" mode, where
an unspecified number communities and landmarks can be identified. This
functionality was introduced because some states have laws that seek
to consider communities of interest while redistricting. 

The Communities mode differs from the plain Districting mode because
the number of communities you draw might be dynamic vs static, the
communities you create can be named or described and landmarks can
be drawn, named and described. 

_Important Places doesn't cancel itself, must create before deleting._

Conversely, Data Layers and Evaluation tabs often feature similar
functionality to the Districting mode. 

communityIdPlugins = [ToolsPlugin, DataLayersPlugin, CommunityPlugin];

= ToolsPlugin
- PopulationBalancePlugin
= DataLayersPlugin
+ CommunityPlugin 
- Evaluation Plugin

## Loading through the State Portal

Just as every state or place have certain modules that allow districts
of specific numbers to be drawn out of units like block groups or
precincts, statewide, city or regional communities can also be built
out of the same unis. 

Within state portal, onlycommunitymode if places == 0, a vestige. 

CommunityOptions a list of
PlaceItemsTemplateCommunities
here we set the problem, problem = { type: "community", numberOfParts: 50, pluralNoun: "Community" };

### Routes
startNewPlan from routes
navigates to /COI 
deploy coi.html to package.json goes to edit.html, edit.js

### Vestiges
community.js
community.html


## Loading the Editor for COIs

communityIdPlugins = [ToolsPlugin, DataLayersPlugin, CommunityPlugin];

!!! Diffrerent map! Uses streets not light-v10

Editor does not care if its a community or not

### State object

only first part is visible
part name is "Community 1" etc...
mapstate, addBelowLabels not addBelowSymbols

## ToolsPlugin and Toolbar

Brush now __CommunityBrush__
Makes __LandmarkTool__
brush OptionsMarked as community
no c_checker
labels export COI plan
src/components/Modal.js problem.type === community

### brushOptions and BrushTool


???
```
if (document.querySelectorAll) {
            let community_opts = document.querySelectorAll('.custom-select .custom-option');
            if (community_opts.length) {
               community_opts[e.target.value * 1].click();
               document.querySelector('.custom-select__trigger').click();
            }
        }
``` 

options.community 

## Data Layers Plugin
        
Labels, "community", "community"        
community and __neighborhoods__ suggest
- miamifl, miamidade, lax, lowell
community and __load_coi__ suggest
- only false in colorado and connecticut!!

_simplify labels, Community my Communities community_
   
# Community Plugin, a big deal!
Replaces PopulationBalancePlugin
Also titled "drawing"

src/components/PlacesList.js
src/components/PlaceMap.js

src/models/Subgroup.js Community only when erasing

src/lambda/moduleRead.js communtiy
src/lambda/planText.js community
src/lambda/moduleRead.js community

__Only Used in CommunityPlugin!__
src/components/Charts/PivotTable.js community Parameter

__Used in Data Layers and Community Plugin__ 
src/components/Charts/CoalitionPivotTable.js community vs districtview
Only Label, asks "districtview"!!!



src/components/Toolbar/LandmarkTool.js community

_!!! pop-balance-plugin (showvra), evaluation plugin has community detail but not ever called by community!!!_
coi2??? 

