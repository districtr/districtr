# Community Plugin

state and mapState from `editor.state` and `editor.mapState`

adds `addLocationSearch` to mapState

New Tab "Community"
New `AboutSection`
- RevealSection `AreasOfInterest`
- RevealSection "Important Places"

New Tab Population Eval Tab
- RevealSection Population
- RevealSection CVAP
- RevealSection Household Income
- RevealSection household Renter

### addLocationSerach 

Uses `MapboxGeocoder `

# Class LandmarkOptions

Completely different from 
LandmarkOptions in Landmark.js.
Garrrrh!

## Constructor

- this.points = landmarks.points;
- this.drawTool = landmarks.drawTool;
- this.features = features;
- this.map = map;
- this.updateLandmarkList = - landmarks.updateLandmarkList;

## Class Functions

- setName(name)
- setDescription
- saveFeature
- deleteFeature
- onDelete
- renders Button, etc.