require('es6-promise').polyfill();
var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var babel = require("gulp-babel");

gulp.task('copy-dependencies', function() {
    gulp.src(['./node_modules/jquery/dist/jquery.js'])
        .pipe(gulp.dest('./src/lib/jquery'));
});

gulp.task('compile-src', function () {
    gulp.src(['./src/app/**/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('./dist/'));
});

//Watch task
gulp.task('default', function() {
    gulp.watch('./src/app/**/*.js', ['compile-src']);
});
