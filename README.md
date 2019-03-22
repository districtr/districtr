# Districtr

Districtr is the open-source web app that empowers all people to draw districting plans.

## Project values

- **User experience.** Participating in the redistricting process should be easy and enjoyable.
- **Openness and transparency.** The entire project is open-source, with permissive licenses.
  All of the data used in the app is [freely available](https://github.com/mggg-states) and well-documented.
  We explicitly declare where we get our data, how we've processed it, and what we think of its quality.
- **Responsiveness to the community.** Different places have different values and priorities when
  it comes to drawing districts. We aim to highlight the specific concerns of the community in each place
  that we include in the app.

## Contributing

If you're interested in contributing, thank you! Send an email to [max@mggg.org](mailto:max@mggg.org)
and we'll find a way that you can get involved.

### Development

Here's how to get started. 

1. Install [GitHub for Desktop](https://desktop.github.com/) (or just plain `git`),
  [Node.js](https://nodejs.org/en/), and a helpful text editor. We recommend
  [VS Code](https://code.visualstudio.com/).
2. Clone the repository using GitHub for Desktop, or by running
  `git clone https://github.com/gerrymandr/Districtr` from the command line.
3. Install the dependencies by running `npm install`.
4. To start the development server and make sure everything's set up, first run `npm run develop`.
  If you go to `http://localhost:3000`, you should see Districtr running. The development
  server will recompile the app's assets, JavaScript, HTML, and CSS as you edit the source files.

Districtr is built on [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
and [lit-html](https://lit-html.polymer-project.org/guide). We also use [Sass](https://sass-lang.com/)
for authoring CSS.

### Testing

To run the unit test suite, run `npm run test`. We use the [Mocha](https://mochajs.org/)
test framework and the [Chai](https://www.chaijs.com/) assertion library.
We need to write more unit tests!

### Reporting bugs and other issues

One of the best ways to contribute to Districtr (or any open source project) is
to report any bugs, problems, or points of confusion that you find. You can file an
issue in [this GitHub repository](https://github.com/gerrymandr/Districtr/issues).
