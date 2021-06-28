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

export const clean = () => new Promise(resolve => fs.rmdir("./dist", resolve));
export const mkdir = () => new Promise(resolve => fs.mkdir("./dist", resolve));

export const deployFiles = () =>
    gulp.src(sources.deployFiles).pipe(gulp.dest("./dist"));

export const js = () => bundleViews();


function errLog(err, stdout, stderr) {
	if (stdout) {
		console.log(stdout);
	}
	if (stderr) {
		console.log(stderr);
	}
}

export const css = () => exec("sass sass:dist/css/", errLog);
/*
    gulp
        .src(sources.css)
        .pipe(sass())
        .pipe(gulp.dest("./dist/css"))
        .pipe(browserSync.stream());

// export const html = () => gulp.src(sources.html).pipe(gulp.dest("./dist"));
export const html = () =>
	exec('cp -r ' + sources.html + ' ./dist/', function (err, stdout, stderr) {
		if (stdout) {
			console.log(stdout);
		}
		if (stderr) {
			console.log(stderr);
		}
	});

/*
export const assets = () =>
    gulp.src(sources.assets).pipe(gulp.dest("./dist/assets"));
*/
export const assets = () =>
	exec('cp -r ' + sources.assets + ' ./dist/', function (err, stdout, stderr) {
		if (stdout) {
			console.log(stdout);
		}
		if (stderr) {
			console.log(stderr);
		}
	});

export const build = gulp.series(
    clean,
    mkdir,
    gulp.parallel(js, css, html, assets, deployFiles)
);

export const devBuild = gulp.series(
    clean,
    mkdir,
    gulp.parallel(bundleWithCacheForDevelopment, css, html, assets)
);

export const watch = () => {
    gulp.watch(sources.css, gulp.series(css, reload));
    gulp.watch(sources.html, gulp.series(html, reload));
    gulp.watch(sources.js, gulp.series(bundleWithCacheForDevelopment, reload));
    gulp.watch(sources.assets, gulp.series(assets));
};

export const develop = gulp.series(devBuild, serve, watch);
