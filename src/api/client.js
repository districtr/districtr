const API_URL = location.hostname.includes("localhost")
    ? "http://localhost:5000"
    : "";

export default class ApiClient {
    constructor(base_url, middleware) {
        if (base_url === undefined || base_url === null) {
            base_url = API_URL;
        }
        this.base_url = base_url;
        if (middleware === null || middleware === undefined) {
            middleware = [];
        }
        this.middleware = middleware;
    }
    request(uri, method, body, headers) {
        let requestBody;
        if (body !== null && body !== undefined) {
            requestBody = JSON.stringify(body);
        }
        return fetch(
            this.base_url + uri,
            // Pass the request options to each middleware function for modification
            this.middleware.reduce(
                (requestOptions, middleware) => middleware(requestOptions),
                {
                    method: method,
                    body: requestBody,
                    headers: { "Content-Type": "application/json", ...headers }
                }
            )
        );
    }
    get(uri, headers) {
        return this.request(uri, "GET", null, headers);
    }
    post(uri, body) {
        return this.request(uri, "POST", body);
    }
    put(uri, body) {
        return this.request(uri, "PUT", body);
    }
    delete(uri, body) {
        return this.request(uri, "DELETE", body);
    }
    patch(uri, body) {
        return this.request(uri, "PATCH", body);
    }
}

export const client = new ApiClient(API_URL);

/**
 * Given a bearer token, returns a middleware function to add to the API
 * client.
 * @param {string} token
 */
export function createAuthMiddleware(token) {
    return request => {
        request.headers.Authorization = `Bearer ${token}`;
        return request;
    };
}
