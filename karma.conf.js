/* eslint-disable import/no-extraneous-dependencies */
const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require("webpack-merge");

module.exports = config => {
    config.set(
        merge(createDefaultConfig(config), {
            files: [
                {
                    pattern: "test/*.test.js",
                    type: "module"
                }
            ],

            frameworks: ["esm"],

            esm: {
                nodeResolve: true,
                compatibility: "all"
            },

            // you can overwrite/extend the config further
        })
    );
    return config;
};
