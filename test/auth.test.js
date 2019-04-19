import {
    getUserFromToken,
    unauthenticatedUser,
    noBearerToken
} from "../src/api/auth";
import { assert } from "@open-wc/testing";

describe("auth", () => {
    describe("getUserFromToken", () => {
        it("returns unauthenticatedUser for malformed tokens", () => {
            assert.strictEqual(
                getUserFromToken(noBearerToken),
                unauthenticatedUser
            );
            assert.strictEqual(
                getUserFromToken("not-a-token"),
                unauthenticatedUser
            );
            assert.strictEqual(
                getUserFromToken("not.a.token"),
                unauthenticatedUser
            );
        });
        it("returns the encoded user from a token", () => {
            const user = {
                first: "Example",
                last: "Person",
                email: "person@example.com",
                id: 999
            };
            const encodedUser = btoa(JSON.stringify(user));
            const token = `foo.${encodedUser}.bar`;
            assert.deepEqual(getUserFromToken(token), user);
        });
    });
});
