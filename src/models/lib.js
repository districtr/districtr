export function assignLoadedUnits(
    state,
    assignment,
    remainingUnitIds,
    bufferSize = 100
) {
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

    let noFailures = true;

    while (noFailures && remainingUnitIds.length > 0) {
        for (let i = 0; i < bufferSize && remainingUnitIds.length > 0; i++) {
            const unitId = remainingUnitIds.pop();
            const feature = featuresByUnitId[unitId];
            if (state.hasExpectedData(feature)) {
                state.update(feature, assignment[unitId]);
                state.parts[assignment[unitId]].visible = true;
                state.units.setAssignment(feature, assignment[unitId]);
            } else {
                noFailures = false;
                remainingUnitIds.push(unitId);
            }
        }
        state.render();
    }
    return remainingUnitIds;
}

export function assignUnitsAsTheyLoad(state, assignment) {
    let remainingUnitIds = Object.keys(assignment).filter(
        x => x !== undefined && x !== null
    );
    let intervalId;
    const stop = () => window.clearInterval(intervalId);
    const callback = () => {
        if (remainingUnitIds.length === 0) {
            stop();
            state.render();
        }
        remainingUnitIds = assignLoadedUnits(
            state,
            assignment,
            remainingUnitIds
        );
    };
    intervalId = window.setInterval(callback, 200);
}
