var gulp = require('gulp'),
    uglify = require('gulp-uglify');

gulp.task('default', function() {
  return gulp.src('lib/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));
});
