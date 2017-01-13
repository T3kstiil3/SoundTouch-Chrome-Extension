var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('publish/patch', function(callback) {
    runSequence('clean', 'patch', 'pack', 'deploy', callback);
});

gulp.task('publish/feature', function(callback) {
    runSequence('clean', 'feature', 'pack', 'deploy', callback);
});

gulp.task('publish/release', function(callback) {
    runSequence('clean', 'release', 'pack', 'deploy', callback);
});