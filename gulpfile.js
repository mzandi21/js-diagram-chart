var gulp = require('gulp'),
    uglify = require('gulp-uglifyjs');

gulp.task('default', function() {
  return gulp.src('lib/*.js')
    .pipe(uglify('antuane-chart.min.js'))
    .pipe(gulp.dest('dist/'));
});
