var gp = require('gulp-load-plugins')(),
  gulp = require('gulp'),
  es = require('event-stream'),
  streamqueue = require('streamqueue')
  ;

gulp.task('dev.clean', function () {
  gulp.src('.tmp')
    .pipe(gp.clean());
});

gulp.task('dev', ['dev.clean'], function () {
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

gulp.task('build.clean', function () {
  gulp.src('build/**/*.*')
    .pipe(gp.clean());
});

gulp.task('build.js', ['build.clean'], function () {
  var templates = gulp.src('src/**/*.html')
    .pipe(gp.angularTemplatecache({module: 'sun-table'}));

  var src = gulp.src('src/**/*.ts')
    .pipe(gp.sourcemaps.init())
    .pipe(gp.typescript({sortOutput: true}))
    .pipe(gp.ngAnnotate())
    .pipe(gp.concat('sun-table.js'))

  src.pipe(gp.sourcemaps.write('.')).pipe(gulp.dest('build'));

  streamqueue({objectMode: true}, src, templates)
    .pipe(gp.concat('sun-table.js'))
    .pipe(gulp.dest('build'))
    .pipe(gp.uglify())
    .pipe(gp.rename('sun-table.min.js'))
    .pipe(gulp.dest('build'));
});
gulp.task('build.css', ['build.clean'], function () {
  gulp.src('src/**/*.css')
    .pipe(gp.concat('sun-table.css'))
    .pipe(gulp.dest('build'))
    .pipe(gp.cssmin())
    .pipe(gp.rename('sun-table.min.css'))
    .pipe(gulp.dest('build'));
});
gulp.task('build', ['build.js', 'build.css']);

gulp.task('dev.connect', function () {
  gp.connect.server({
    root: ['examples', '.tmp', 'src', '.'],
    livereload: true
  });
});


gulp.task('default', ['dev', 'dev.watch', 'dev.connect']);