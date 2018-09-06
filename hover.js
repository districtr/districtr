function addLayerWithHoverEffect(map, layer) {
  map.addLayer({
    id: `${layer}-fills`,
    type: "fill",
    source: source,
    layout: {},
    paint: {
      "fill-color": "#627BC1",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.5
      ]
    }
  });

  map.addLayer({
    id: `${layer}-borders`,
    type: "line",
    source: "lowell",
    layout: {},
    paint: {
      "line-color": "#627BC1",
      "line-width": 2
    }
  });

  map.on("mousemove", "lowell-fills", function(e) {
    if (e.features.length > 0) {
      if (hoveredStateId) {
        map.setFeatureState(
          { source: "lowell", id: hoveredStateId },
          { hover: false }
        );
      }
      hoveredStateId = e.features[0].id;
      map.setFeatureState(
        { source: "lowell", id: hoveredStateId },
        { hover: true }
      );
    }
  });

  // When the mouse leaves the state-fill layer, update the feature state of the
  // previously hovered feature.
  map.on("mouseleave", "lowell-fills", function() {
    if (hoveredStateId) {
      map.setFeatureState(
        { source: "lowell", id: hoveredStateId },
        { hover: false }
      );
    }
    hoveredStateId = null;
  });
}
