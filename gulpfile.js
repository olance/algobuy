'use strict';

var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    scsslint = require('gulp-scss-lint');

// Linting tasks
gulp.task('lint', ['scss-lint', 'js-lint']);

gulp.task('js-lint', function() {
    return gulp.src(['app/js/**/*.js', 'app/js/**/*.jsx'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('scss-lint', function() {
    return gulp.src(['app/styles/**/*.scss'])
        .pipe(scsslint())
        .pipe(scsslint.failReporter());
});

// Default task will just run lint
gulp.task('default', ['lint']);
