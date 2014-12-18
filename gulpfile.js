var gp = require('gulp-load-plugins')(),
  gulp = require('gulp')
  ;
gulp.task('clean', function () {
  gulp.src('.tmp')
    .pipe(gp.clean());
})
gulp.task('dev', ['clean'], function () {
  return gulp.src('src/**/*.ts').pipe(gp.watch('src/**/*.ts', gp.batch(function (files, cb) {
    //console.log('handler');
    files
      .pipe(gp.plumber())
      .pipe(gp.sourcemaps.init())
      .pipe(gp.typescript())
      .pipe(gp.sourcemaps.write())
      .pipe(gulp.dest('.tmp/'))
      .pipe(gp.connect.reload())
      .on('end', cb);
  })));
});
gulp.task('dev.watch', function () {
  return gp.watch(['src/**/*.html', 'src/**/*.css', 'examples/**/*.html'], function (file) {
    gp.connect.reload().write(file);

  });
});

gulp.task('dev.connect', function () {
  gp.connect.server({
    root: ['examples', '.tmp', 'src', '.'],
    livereload: true
  });
});

gulp.task('default', ['dev', 'dev.watch', 'dev.connect']);