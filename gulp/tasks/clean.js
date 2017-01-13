var gulp = require('gulp');
var clean = require('gulp-clean');
var config = require('../config').deploy;

gulp.task('clean', function () {
    return gulp.src(config.packageName, {read: false}).pipe(clean());
});