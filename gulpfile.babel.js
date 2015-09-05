import gulp from 'gulp';
import eslint from 'gulp-eslint';
import scsslint from 'gulp-scss-lint';

// Default task will just run lint
gulp.task('default', ['lint']);


// LINTING TASKS
gulp.task('lint', ['scss-lint', 'js-lint']);

gulp.task('js-lint', () => {
    gulp.src(['app/js/**/*.js', 'app/js/**/*.jsx'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('scss-lint', () => {
    gulp.src(['app/styles/**/*.scss'])
        .pipe(scsslint())
        .pipe(scsslint.failReporter());
});
