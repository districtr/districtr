import fs from "fs";
import { rollup } from "rollup";
import plugins from "./rollup-plugins";

const IE_TARGETS = "> 0.25%, last 2 versions, Firefox ESR, not dead";
const MODERN_TARGETS =
    "> 0.25%, last 2 versions, Firefox ESR, not dead, not ie < 999";

export function bundleView(view, production=true, cache) {
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
            bundle.write({
                file: `./dist/es5/${view}.js`,
                format: "umd",
                name: "ieBundle",
                sourcemap: true
            })
        ),
        rollup({
            input: `./src/views/${view}.js`,
            plugins: plugins(MODERN_TARGETS, !production),
            cache: !production ? cache : false,
            onwarn: (warning, warn) => {
                if (warning.code === 'CIRCULAR_DEPENDENCY') return;
                warn(warning);
            }
        }).then(bundle =>
            bundle.write({
                file: `./dist/es6/${view}.js`,
                format: "umd",
                name: "bundle",
                sourcemap: true
            })
        )
    );
}

export default function bundleViews(production=true, caches) {
    return new Promise((resolve, reject) =>
        fs.readdir("./src/views/", (err, files) => {
            if (err) {
                reject(err);
            }
            return resolve(files.map(filename => filename.split(".")[0]));
        })
    ).then(views =>
        Promise.all(
            views.map(view =>
                bundleView(view, production, caches ? caches[view] : null)
            )
        )
    );
}
