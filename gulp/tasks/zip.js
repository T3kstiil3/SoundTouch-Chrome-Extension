const gulp = require('gulp');
const zip = require('gulp-zip');

const config = require('../config').deploy;

gulp.task('zip', () => {
    return gulp.src(config.packItems)
        .pipe(zip(config.packageName))
        .pipe(gulp.dest('./'));
});