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

    gulp.src(['./node_modules/bootstrap/scss/**/_*.scss'])
        .pipe(gulp.dest('./src/scss/vendor/bootstrap'));
});

gulp.task('compile-js', function () {
    gulp.src(['./src/app/**/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('compile-sass', function() {
    gulp.src('./src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compact' }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie >= 8', 'ios >= 8'],
            cascade: false
        }))
        .pipe(sourcemaps.write({ sourceRoot: './dist' }))
        .pipe(gulp.dest('./dist/'));
});

//Watch task
gulp.task('default', function() {
    console.log(' | |         | |             | |    ');
    console.log(' | |    _   _| |__   ___     | |___ ');
    console.log(' | |   | | | | \'_ \\ / _ \\_   | / __|');
    console.log(' | |___| |_| | |_) |  __/ |__| \\__ \\');
    console.log(' |______\\__,_|_.__/ \\___|\\____/|___/');

    gulp.watch('./src/app/**/*.js', ['compile-js']);
    gulp.watch('./src/scss/**/*.scss', ['compile-sass']);
});
