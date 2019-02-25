export function assignLoadedUnits(state, assignment, remainingUnitIds) {
    const featuresByUnitId = state.units
        .queryRenderedFeatures()
        .reduce((lookup, feature) => {
            const featureId = state.idColumn.getValue(feature);
            if (featureId !== undefined && featureId !== null) {
                return {
                    ...lookup,
                    [featureId]: feature
                };
            }
            return lookup;
        }, {});

    remainingUnitIds.forEach(unitId => {
        const feature = featuresByUnitId[unitId];
        const hasExpectedData = state.hasExpectedData(feature);
        if (hasExpectedData) {
            state.update(feature, assignment[unitId]);
            state.parts[assignment[unitId]].visible = true;
            state.units.setAssignment(feature, assignment[unitId]);
            remainingUnitIds.delete(unitId);
        }
    });
    return remainingUnitIds;
}

export function assignUnitsAsTheyLoad(state, assignment) {
    let remainingUnitIds = new Set(Object.keys(assignment));
    let intervalId = null;
    const stop = () => window.clearInterval(intervalId);
    const callback = () => {
        if (remainingUnitIds.size === 0) {
            stop();
            state.render();
        }
        remainingUnitIds = assignLoadedUnits(
            state,
            assignment,
            remainingUnitIds
        );
    };
    intervalId = window.setInterval(callback, 100);
}
