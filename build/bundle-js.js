import fs from "fs";
import gulp from "gulp";
import { rollup } from "rollup";
import plugins from "./rollup-plugins";
import async from "async";

const IE_TARGETS = "> 0.25%, last 2 versions, Firefox ESR, not dead";
const MODERN_TARGETS =
    "> 0.25%, last 2 versions, Firefox ESR, not dead, not ie < 999";

// We could run rollup twice in parallel (for production builds), 
// but it is unknown if there will be race conditions, etc.
// For production builds, it's probably safer to call bundle.write 
// in sequence for now.
export function bundleView(view, production = true, cache) {
    return (
        rollup({
            input: `./src/views/${view}.js`,
            plugins: plugins(IE_TARGETS, !production),
            cache: !production ? cache : false,
            onwarn: (warning, warn) => {
                if (warning.code === 'CIRCULAR_DEPENDENCY') return;
                warn(warning);
            }
        }).then(bundle =>
		{
		bundle.write({
		    file: `./dist/es6/${view}.js`,
		    format: "umd",
		    name: "bundle",
		    sourcemap: production
		});
		    if (production) {
		    bundle.write({
			file: `./dist/es5/${view}.js`,
			format: "umd",
			name: "ieBundle",
			sourcemap: production
		    });
		    }
		}
        )
    );
}


export default function bundleViews(production = true, caches) {
    return new Promise((resolve, reject) =>
        fs.readdir("./src/views/", (err, files) => {
            if (err) {
                reject(err);
            }
            return resolve(files.map(filename => filename.split(".")[0]));
        })
    ).then(views =>
	async.map(views, function (view) {
	    console.time(view);
            bundleView(view, production, caches ? caches[view] : null)
	    console.timeEnd(view);
	})
    );
}
