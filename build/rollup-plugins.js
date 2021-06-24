import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import rjson from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";

export default function plugins(targets, development = false) {
    return [
        resolve({ preferBuiltins: false }),
        commonjs(),
        rjson(),
        babel({
            babelrc: false,
            presets: [
                [
                    "@babel/preset-env",
                    {
                        targets: targets || "> 0.25%, not dead"
                    }
                ]
            ],
            babelHelpers: 'bundled',
            exclude: /node_modules\/(?!(lit-html))/
        }),
        development ? false : terser()
    ].filter(Boolean);
}
