import browserSync from "browser-sync";
import fs from "fs";
import gulp from "gulp";
import sass from "gulp-sass";
import bundleViews from "./build/bundle-js";
import {
    bundleWithCacheForDevelopment,
    reload,
    serve
} from "./build/dev-server";

const sources = {
    js: "./src/**/*.js",
    css: "./sass/**/*.scss",
    html: "./html/*.html",
    assets: "./assets/**"
};

export const clean = () => new Promise(resolve => fs.rmdir("./dist", resolve));

export const js = () => bundleViews();

export const css = () =>
    gulp
        .src(sources.css)
        .pipe(sass())
        .pipe(gulp.dest("./dist/css"))
        .pipe(browserSync.stream());

export const html = () => gulp.src(sources.html).pipe(gulp.dest("./dist"));

export const assets = () =>
    gulp.src(sources.assets).pipe(gulp.dest("./dist/assets"));

export const build = gulp.series(clean, gulp.parallel(js, css, html, assets));

export const devBuild = gulp.series(
    clean,
    gulp.parallel(bundleWithCacheForDevelopment, css, html, assets)
);

export const watch = () => {
    gulp.watch(sources.css, gulp.series(css, reload));
    gulp.watch(sources.html, gulp.series(html, reload));
    gulp.watch(sources.js, gulp.series(bundleWithCacheForDevelopment, reload));
    gulp.watch(sources.assets, gulp.series(assets));
};

export const develop = gulp.series(devBuild, serve, watch);
