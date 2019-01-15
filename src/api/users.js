
var rp = require("request-promise"),

    root = "http://localhost:5000/";


/**
 * @desc Attempts to get the `User` matching the `id` parameter.
 * @param {Number | String} id Id tag for the requested `User`.
 * @returns {Promise}
 */
function getUser(id) {
    var path = root + "users/",
        options = {
            uri: path + id,
            method: "GET"
        };

    return rp(options);
}


/**
 * @desc Attempts to retrieve all `User` objects in the database.
 * @returns {Promise}
 */
function getAllUsers() {
    return rp(root + "users/");
}


/**
 * @desc Attempts to create a new user in the database.
 * @param {Object} user JSON object containing fields for a `User` object.
 * @returns {Promise}
 */
function createUser(user) {
    var path = root + "users/",
        options = {
            method: "POST",
            uri: path,
            json: true,
            body: user
        }

    return rp(options);
}


/**
 * @desc Attempts to update an existing user in the database.
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
 * @desc Attempts to delete the specified user.
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
