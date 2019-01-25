
import { throwFetchError } from "../utils";

const root = "http://localhost:5000/";


/**
 * Attempts to get the `User` matching the `id` parameter.
 * @param {Number | String} id Id tag for the requested `User`.
 * @returns {Promise} A Promise.
 */
function getUser(id) {
    var path = root + "users/" + id;
    return fetch(path).then(throwFetchError);
}


/**
 * Attempts to retrieve all `User` objects in the database.
 * @returns {Promise}
 */
function getAllUsers() {
    return fetch(root + "users/").then(throwFetchError);
}


/**
 * Attempts to create a new user in the database.
 * @param {Object} user JSON object containing fields for a `User` object.
 * @returns {Promise}
 */
function createUser(user) {
    var path = root + "users/",
        options = {
            method: "POST",
            body: JSON.stringify(user)
        }

    return fetch(path, options).then(throwFetchError);
}


/**
 * Attempts to update an existing user in the database.
 * @param {Object} user JSON object containing updated fields for an existing
 * `User` object.
 * @returns {Promise} 
 */
function updateUser(user) {
    var path = root + "users/" + user.id,
        options = {
            method: "PATCH",
            uri: path,
            json: true,
            body: user
        };

    return rp(options);
}


/**
 * Attempts to delete the specified user.
 * @param {Number | String} id Id tag for the requested user.
 * @returns {Promise}
 */
function deleteUser(id) {
    var path = root + "users/" + id,
        options = {
            method: "DELETE",
            uri: path
        };

    return rp(options);
}

export {
    getUser,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};
