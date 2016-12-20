const gulp = require('gulp');
const zip = require('gulp-zip');

gulp.task('export', () => {

});
 
gulp.task('zip', () => {
    return gulp.src(['!node_modules','!node_modules/*','!dist','!dist/*','!main.js','!gulpfile.js','*','*/*'])
        .pipe(zip(renderFileName()))
        .pipe(gulp.dest('../'));
});

function renderFileName(){
    var utc = new Date().toJSON().slice(0,10);
    return 'SoundTouch-Chrome-Extension-'+utc+'.zip';
}