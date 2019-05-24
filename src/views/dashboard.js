import { render, html } from "lit-html";

import initializeAuthContext from "../api/auth";
import { client } from "../api/client";
import { loadablePlans } from "../components/PlanList";
import { linkToPlan, navigateTo } from "../routes";

function byId(items) {
    return items.reduce((lookup, item) => ({ ...lookup, [item.id]: item }), {});
}

export default () => {
    initializeAuthContext(client)
        .then(token => {
            if (!token) {
                navigateTo("/signin");
            }
        })
        .then(() =>
            Promise.all([
                client.get("/user/plans/").then(r => {
                    if (r.ok) {
                        return r.json();
                    } else {
                        navigateTo("/signin");
                    }
                }),
                client
                    .get("/places/")
                    .then(r => r.json())
                    .then(plans =>
                        plans.map(plan => ({
                            ...plan,
                            districting_problems: byId(
                                plan.districting_problems
                            )
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
                                    image: "/assets/districting-plan.svg",
                                    ...plan,
                                    place: placesById[plan.place_id],
                                    problem:
                                        placesById[plan.place_id]
                                            .districting_problems[
                                            plan.problem_id
                                        ],
                                    url: linkToPlan(plan.id)
                                }))
                            )}
                        `,
                        target
                    );
                }
            })
        );
};
