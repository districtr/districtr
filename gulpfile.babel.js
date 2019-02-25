import gulp from "gulp";
import sass from "gulp-sass";
import bundleViews from "./build/bundle-js";

export const js = bundleViews;

export const css = () =>
    gulp
        .src("./sass/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("./dist/css"));

export const html = () => gulp.src("./html/*.html").pipe(gulp.dest("./dist"));

export const build = gulp.parallel(js, css, html);
