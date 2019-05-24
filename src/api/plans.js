import { client } from "./client";

export function updatePlan(state) {
    const body = { assignment: state.plan.assignment, name: state.plan.name };
    return client.put(`/plans/${state.plan.id}`, body);
}

export function deletePlan(state) {
    return client.delete(`/plans/${state.plan.id}`);
}

export function saveNewPlan(state) {
    const serialized = state.serialize();
    return client.post("/plans/", serialized).then(resp => {
        if (resp.ok) {
            return resp.json().then(({ id }) => {
                state.plan.id = id;
                history.replaceState({}, window.title, `/edit/${id}`);
                return resp;
            });
        }
        return resp;
    });
}

function withSavingMessage(f) {
    return (...args) => {
        const title = document.title;
        document.title = "Saving... | Districtr";
        return f(...args).then((resp, ...args) => {
            if (resp.ok) {
                document.title = title;
            } else {
                console.error("Not ok...");
            }
            return [resp, ...args];
        });
    };
}

export const savePlan = withSavingMessage(state =>
    state.plan.neverSaved ? saveNewPlan(state) : updatePlan(state)
);

export const renamePlan = withSavingMessage(state =>
    client.put(`/plans/${state.plan.id}`, { name: state.plan.name })
);
