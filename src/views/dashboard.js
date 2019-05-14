import { render } from "lit-html";

import initializeAuthContext from "../api/auth";
import { client } from "../api/client";
import { loadablePlans } from "../components/PlanList";

export default () => {
    initializeAuthContext(client).then(() =>
        client
            .get("/plans/")
            .then(r => r.json())
            .then(plans => {
                const target = document.getElementById("my-plans");
                render(
                    loadablePlans(
                        plans.map(plan => ({
                            ...plan,
                            url: `/edit#${plan.id}`
                        }))
                    ),
                    target
                );
            })
    );
};
