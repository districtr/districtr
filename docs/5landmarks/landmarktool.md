# Landmark Tool

Extends `Tool` 

## Constructor

- `this.state`
- `this.renderCallback` is `state.render`

Creates `staet.place.landmarks`

> Initialized only here!

`state.place.landmarks.source`
`state.place.landmarks.type`
`state.place.landmarks.data`
`state.place.landmarks.data.features`

Uses `Landmarks` object and `LandmarkOptions`. 

## Class Functions
- updateLandmarkList(...)
- saveFeature(id)
- deleteFeature()
- activate()
- deactivate()

# LandmarkOptions

For rendering tool options

- `handleSelectFeature`
- `setName`
- `setDescription`
- `onSave`
- `onDelete`
- render