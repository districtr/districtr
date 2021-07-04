import browserSync from "browser-sync";
import fs from "fs";
import gulp from "gulp";
import sass from "gulp-dart-sass";
import bundleViews from "./build/bundle-js";
import {
    bundleWithCacheForDevelopment,
    reload,
    serve
} from "./build/dev-server";

var exec = require('child_process').exec;

const sources = {
    js: "./src/**/*.js",
    css: "./sass/**/*.scss",
    html: "./html/*.html",
    assets: "./assets",
    deployFiles: "./deploy/**"
};

export const mkdir = () => new Promise(resolve => fs.mkdir("./dist", resolve));

export const deployFiles = () => gulp.src(sources.deployFiles).pipe(gulp.dest("./dist"));

export const js = () => bundleViews();


export const cssExec = () => new Promise(resolve => exec("sass sass:dist/css/", resolve));
export const cssPipe = () =>
    gulp
        .src(sources.css)
        .pipe(sass())
        .pipe(gulp.dest("./dist/css"))
        .pipe(browserSync.stream());

// export const html = () => gulp.src(sources.html).pipe(gulp.dest("./dist"));
export const html = () => new Promise(resolve => exec('rsync -a --update html/ ./dist/', resolve));

/*
export const assets = () =>
    gulp.src(sources.assets).pipe(gulp.dest("./dist/assets"));
*/
export const assets = () => new Promise(resolve => exec('rsync -a --update assets ./dist/', resolve));

export const build = gulp.series(
    mkdir,
    gulp.parallel(js, cssPipe, html, assets, deployFiles)
);

export const devBuild = gulp.series(
    mkdir,
    gulp.parallel(bundleWithCacheForDevelopment, cssExec, html, assets)
);

export const watch = () => {
    gulp.watch(sources.css, gulp.series(cssExec, reload));
    gulp.watch(sources.html, gulp.series(html, reload));
    gulp.watch(sources.js, gulp.series(bundleWithCacheForDevelopment, reload));
    gulp.watch(sources.assets, gulp.series(assets));
};

export const develop = gulp.series(devBuild, serve, watch);
