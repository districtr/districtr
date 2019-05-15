import { render, html } from "lit-html";

import initializeAuthContext from "../api/auth";
import { client } from "../api/client";
import { loadablePlans } from "../components/PlanList";

function byId(items) {
    return items.reduce((lookup, item) => ({ ...lookup, [item.id]: item }), {});
}

function editPlanURL(planId) {
    if (location.hostname.includes("localhost")) {
        return `/edit#${planId}`;
    } else {
        return `/edit/${planId}`;
    }
}

export default () => {
    initializeAuthContext(client).then(() =>
        Promise.all([
            client.get("/user/plans/").then(r => {
                if (r.ok) {
                    return r.json();
                } else {
                    return null;
                }
            }),
            client
                .get("/places/")
                .then(r => r.json())
                .then(plans =>
                    plans.map(plan => ({
                        ...plan,
                        districting_problems: byId(plan.districting_problems)
                    }))
                )
                .then(byId)
        ]).then(([plans, placesById]) => {
            const target = document.getElementById("my-plans");
            if (plans !== null) {
                render(
                    html`
                        <h2>Recent plans</h2>
                        ${loadablePlans(
                            plans.map(plan => ({
                                ...plan,
                                place: placesById[plan.place_id],
                                problem:
                                    placesById[plan.place_id]
                                        .districting_problems[plan.problem_id],
                                url: editPlanURL(plan.id)
                            }))
                        )}
                    `,
                    target
                );
            }
        })
    );
};
