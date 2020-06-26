let gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    dest = require('gulp-dest');

gulp.task('sass', () => {
  return gulp
    .src('public/styles/sass/*.scss')
    .pipe(sass())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(dest('public/styles'))
    .pipe(gulp.dest('.'));
});

gulp.task('watch', () => {
  gulp.watch('public/styles/sass/*.scss', gulp.series('sass'));
});