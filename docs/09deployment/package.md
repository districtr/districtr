# package.json

Building and deploying districtr.org requires [Node Package Manager] to
external javascript libraries that the webapp depends on. In this way,
districtr becomes its own javascript package. Typical `pacakage.json`s
include a `name`, `version`, `description`, `repository` location, 
`keywords`, `author`, `license`, list of `bugs` location and `homepage`.

Of vital importance are `dependencies`, required to run the package,
`devDependencies`, used internally as a test and documentation
framework, and `scripts` commands used to built, develop and start the
app.

Districtr was innaugurated as an npm package on Thu., Sept. 6, 2018 by
[@maxhully] with help from [@apizzimenti]. It is now maintained by
[@mapmeld] since the Fall of 2019.


## Dependencies

According to npm, "Dependencies are specified in a simple object that
maps a package name to a version range." These dependencies are meant
for run-time operation, whereas test and documentation packages are
listed in `devDependencies`.

The following dependencies are used directly in districtr code.

### The Site Framework

The most vital packages districtr is built upon is as follows.
- `"[lit-html]": "^1.1.2"`, our templating scheme for html
- `"[mapbox-gl]": "^2.2.0"`, the library for vector maps with which we
display and use for editing
- `"[netlify-lambda]": "^1.6.3"`, the utility we use to write netlify
functions.
        
### Babel and Rollup

We use [Babel] to create a website that works for browsers with
older versions of javascript. We then use [rollup] to combine this
code into a single package. [Caniuse-lite] also helps us determine
whether certain web elements are compatible with certain browsers.

- `"@babel/plugin-transform-runtime": "^7.8.3"`
- `"@babel/runtime": "^7.8.3"`
- `"@rollup/plugin-json": "^4.1.0"`
- `"caniuse-lite": "^1.0.30001165"`

### Other Utilities

[D3] is a javascript library that helps us visualize and interact
with data. We use it to help with colors, transitions and for
plotting the vector [`PlaceMap`]. Towards that end, we use
the [geo-albers] package to help us plot using the proper
projection.
 
- `"d3-geo": "^2.0.1",`
- `"d3-scale-chromatic": "^1.5.0",`
- `"d3-selection": "^1.4.0",`
- `"d3-transition": "^1.2.0",`
- `"geo-albers-usa-territories": "0.0.2"`

Finally, we use...

- `"encoding": "^0.1.12"`, [encoding] to help us with String formats and
- `"hotkeys-js": "^3.7.6"`, [hotkeys-js] to read keystroke input. 

## devDependencies

Development dependencies are packages that are used for local
development and not distribution, like those related to testing and
documentation. [Gulp] helps us automate tasks like compilation and
[npm run all] helps us run npm scripts. 

- `"gulp": "^4.0.2"`
- `"gulp-dart-sass": "^0.9.1"`
- `"npm-run-all": "^4.1.5"`

The following also helps us load modules and environment variables
easily. 

- `"dotenv": "^8.1.0"`, [dotenv]
- `"esm": "^3.2.25"`, [esm]
- `"node-fetch": "^2.6.1"`, node-fetch

### Backwards Compatibility

Again, to ensure that our code works with older browsers, we use the
Babel compiler while using rollup to compile this code into a bundle.
Browsersync also helps us work with different browsers.

- `"@babel/core": "^7.6.2"`
- `"@babel/preset-env": "^7.6.2"`
- `"@babel/register": "^7.6.2"`
- `"@rollup/plugin-babel": "^5.0.2"`
- `"@rollup/plugin-commonjs": "^12.0.0"`
- `"@rollup/plugin-node-resolve": "^8.0.0"`
- `"rollup": "^2.10.9"`
- `"rollup-plugin-terser": "^6.1.0"`
- `"babel-polyfill": "^6.26.0"`
- `"browser-sync": "^2.26.14"`

### Testing           

We use various tools to test our script. [Chai] is an assertion library
that works with [Mocha], which performs browser tests. [Karma] helps us
test modules quickly without bundling and eslint helps us find patterns
in our code to help us script more efficiently. [Sinon] is another way
to test javascript tidbits.

- `"mocha": "^6.2.0"`
- `"mocha-junit-reporter": "^1.23.1"`
- `"chai": "^4.2.0"`
- `"@open-wc/karma-esm": "^2.10.6"`
- `"@open-wc/testing": "^2.3.4"`
- `"@open-wc/testing-karma": "^4.0.9"`
- `"@open-wc/testing-karma-bs": "^1.3.90"`
- `"karma-firefox-launcher": "^1.2.0"`
- `"sinon": "^7.5.0"`

### Working Website

[MongoDB] is the way we store written plans in a database and [Mongoose]
allows us to interact with the database asynchronously. Sass helps us
write css code.

- `"mongodb-client-encryption": "^1.2.3"`
- `"mongoose": "^5.12.7"`
- `"sass": "^1.22.12"`

## Scripts 

According to npm, the "'scripts' property is a dictionary containing
script commands that are run at various times in the lifecycle of your
package. The key is the lifecycle event, and the value is the command to
run at that point." That means, we can use the following within the npm
framework to build, test and start our website. 

### Building and Deploying

Creating a local test server for districtr requires the following
commands. Using gulp, we build the app. Netlify lambda functions are
collected and aliases help direct certain html addresses to other html
files. Develop turns on the local development server. 

- `"build": "npm run build:aliases && npm run build:lambda && npm run build:app"`
- `"build:aliases": "cp html/edit.html html/COI.html &&...`
- `"build:app": "gulp build"`
- `"build:lambda": "netlify-lambda build src/lambda"`
- `"develop": "gulp develop"`

Start similarly develops and starts the app. 

- `"start": "run-p start:**"`
- `"start:app": "gulp develop"`
- `"start:lambda": "netlify-lambda serve src/lambda"`

### Testing 

Local testing requires validation and Karma takes care of the rest.

- `"validate": "node validate.js"`
- `"test": "node validate.js && karma start --coverage"`
- `"test:watch": "karma start --auto-watch=true --single-run=false"`
- `"test-ci": "node validate.js && karma start --single-run --browsers Firefox"`

Lint helps us refactor the code. 

- `"lint": "eslint src"`

# #

### Suggestions

Wrangling packages for npm is its own specialty. While reviewing the code,
it appears that `caniuse-lite?` and `encoding` don't appear to be used
but may serve some other function, like as prerequisites. 

# #

[Return to Main](../README.md)
- [Routes](../09deployment/routes.md)
- [Intro to districtr-eda](../09deployment/districtreda.md)
- [Intro to mggg-states](../09deployment/mggg-states.md)
- [Netlify Lambda Functions and MongoDB](../09deployment/mongolambdas.md)
- Previous: [Headers and Redirects](../09deployment/headersredirects.md)

[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld
[@apizzimenti]: http://github.com/apizzimenti

[Node Package Manager]: https://www.npmjs.com/
[lit-html]: https://lit-html.polymer-project.org/
[mapbox-gl]: https://docs.mapbox.com/mapbox-gl-js/api/
[netlify-lambda]: https://github.com/netlify/netlify-lambda
[Babel]: https://babeljs.io/
[rollup]: https://rollupjs.org/
[Caniuse-lite]: https://www.npmjs.com/package/caniuse-lite
[D3]: https://d3js.org/
[`PlaceMap`]: ../07pages/placemap.md
[geo-albers]: https://github.com/stamen/geo-albers-usa-territories
[encoding]: https://www.npmjs.com/package/encoding
[hotkeys-js]: https://www.npmjs.com/package/hotkeys-js
[Gulp]: https://gulpjs.com/
[npm run all]: https://www.npmjs.com/package/npm-run-all
[dotenv]: https://www.npmjs.com/package/dotenv
[esm]: https://www.npmjs.com/package/esm
[node-fetch]: https://www.npmjs.com/package/node-fetch
[babel-polyfill]: https://babeljs.io/docs/en/babel-polyfill
[browser-sync]: https://browsersync.io/
[Chai]: https://www.chaijs.com/
[Mocha]: https://mochajs.org/
[Sinon]: https://sinonjs.org/
[Mongoose]: https://mongoosejs.com/
[MongoDB]: https://www.mongodb.com/

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA