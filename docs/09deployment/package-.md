# package.json

Package.json is for npm

"scripts
The "scripts" property is a dictionary containing script commands that are run at various times in the lifecycle of your package. The key is the lifecycle event, and the value is the command to run at that point."



{
    "name": "districtr",
    "version": "0.0.1",
    "description": "A tool for drawing districting plans",
    "scripts": {
        "test": "node validate.js && karma start --coverage",
        "build": "npm run build:aliases && npm run build:lambda && npm run build:app",
        "build:aliases": "cp html/edit.html html/COI.html && cp html/edit.html html/plan.html && cp html/event.html html/tag.html && cp html/event.html html/group.html",
        "build:app": "gulp build",
        "build:lambda": "netlify-lambda build src/lambda",
        "develop": "gulp develop",
        "lint": "eslint src",
        "start": "run-p start:**",
        "start:app": "gulp develop",
        "start:lambda": "netlify-lambda serve src/lambda",
        "test:watch": "karma start --auto-watch=true --single-run=false",
        "test-ci": "node validate.js && karma start --single-run --browsers Firefox",
        "validate": "node validate.js"
    },
    "repository": {
        "type": "git",
        "url": "git+https://github.com/districtr/districtr.git"
    },
    "keywords": [
        "gis",
        "voting-rights",
        "redistricting"
    ],
    "author": "Metric Geometry and Gerrymandering Group",
    "license": "MIT",
    "bugs": {
        "url": "https://github.com/districtr/districtr/issues"
    },
    "homepage": "https://github.com/districtr/districtr#readme",

devDependencies
If someone is planning on downloading and using your module in their program, then they probably don't want or need to download and build the external test or documentation framework that you use.

In this case, it's best to map these additional items in a devDependencies object.



    "devDependencies": {
        // Backwards Compatibility
        "@babel/core": "^7.6.2",
        "@babel/preset-env": "^7.6.2",
        "@babel/register": "^7.6.2",

        // "Karma plugin for testing with real es modules without any bundling."
        "@open-wc/karma-esm": "^2.10.6",
        "@open-wc/testing": "^2.3.4",
        "@open-wc/testing-karma": "^4.0.9",
        "@open-wc/testing-karma-bs": "^1.3.90",

        Rollup is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex, such as a library or application

        "@rollup/plugin-babel": "^5.0.2",
        "@rollup/plugin-commonjs": "^12.0.0",
        "@rollup/plugin-node-resolve": "^8.0.0",

        Provides polyfills necessary for a full ES2015+ environment
        "babel-polyfill": "^6.26.0",

        eep multiple browsers & devices in sync when building websites.
        "browser-sync": "^2.26.14",

        Chai is a BDD / TDD assertion library for node and the browser that can be delightfully paired with any javascript testing framework.
        "chai": "^4.2.0",

        Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env
        "dotenv": "^8.1.0",

        ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
        "eslint": "^6.4.0",

        The brilliantly simple, babel-less, bundle-less ECMAScript module loader.

esm is the world’s most advanced ECMAScript module loader. This fast, production ready, zero dependency loader is all you need to support ECMAScript modules in Node 6+.
        "esm": "^3.2.25",

        Automation - gulp is a toolkit that helps you automate painful or time-consuming tasks in your development workflow.
        "gulp": "^4.0.2",
        "gulp-dart-sass": "^0.9.1",

        The main goal for Karma is to bring a productive testing environment to developer
        "karma-firefox-launcher": "^1.2.0",

        Simple, flexible, fun JavaScript test framework for Node.js & The Browser ☕️
        "mocha": "^6.2.0",
        "mocha-junit-reporter": "^1.23.1",

        MongoDB: The most popular database for modern apps
        "mongodb-client-encryption": "^1.2.3",

        Mongoose. Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment. Mongoose supports both promises and callbacks.
        "mongoose": "^5.12.7",

        A light-weight module that brings window.fetch to Node.js
        The Fetch API provides an interface for fetching resources (including across the network). It will seem familiar to anyone who has used XMLHttpRequest, but the new API provides a more powerful and flexible feature set.
        "node-fetch": "^2.6.1",

        A CLI tool to run multiple npm-scripts in parallel or sequential.
        "npm-run-all": "^4.1.5",

        ---
        "rollup": "^2.10.9",
        "rollup-plugin-terser": "^6.1.0",

        Sass is the most mature, stable, and powerful professional grade CSS extension language in the world.
        "sass": "^1.22.12",

Standalone and test framework agnostic JavaScript test spies, stubs and mocks
        "sinon": "^7.5.0",

webpack-merge provides a merge function that concatenates arrays and merges objects creating a new object. 
        "webpack-merge": "^4.2.2"
    },

Dependencies are specified in a simple object that maps a package name to a version range. The version range is a string which has one or more space-separated descriptors. Dependencies can also be identified with a tarball or git URL.

Please do not put test harnesses or transpilers or other "development" time tools in your dependencies object. See devDependencies, below.

    "dependencies": {
        "@babel/plugin-transform-runtime": "^7.8.3",
        "@babel/runtime": "^7.8.3",
        "@rollup/plugin-json": "^4.1.0",

        A javascript filter for badwords
        "bad-words": "^3.0.4",

        CanIUse is an extremely useful tool for quickly visualizing which frontend technologies are compatible with which browsers.
        "caniuse-lite": "^1.0.30001165",

        d3 
        "d3-geo": "^2.0.1",
        "d3-scale-chromatic": "^1.5.0",
        "d3-selection": "^1.4.0",
        "d3-transition": "^1.2.0",

        encoding is a simple wrapper around iconv-lite to convert strings from one encoding to another.
        "encoding": "^0.1.12",

        A map projection including all US overseas territories.
        "geo-albers-usa-territories": "0.0.2",

        HotKeys.js is an input capture library
        "hotkeys-js": "^3.7.6",

        Efficient, Expressive, Extensible HTML templates in JavaScript
        "lit-html": "^1.1.2",

        Mapbox GL JS is a JavaScript library for interactive, customizable vector maps on the web.
        "mapbox-gl": "^2.2.0",

        This is an optional tool that helps with building or locally developing Netlify Functions with a simple webpack/babel build step
        "netlify-lambda": "^1.6.3"
    }
}