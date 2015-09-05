import gulp from 'gulp';
import util from 'gulp-util';

import eslint from 'gulp-eslint';
import scsslint from 'gulp-scss-lint';

import {argv} from 'yargs';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import gulpif from 'gulp-if';
import uglify from 'gulp-uglify';
import sass from 'gulp-sass';
import minifyCss from 'gulp-minify-css';
import rename from 'gulp-rename';


const DIST_DIR = './dist';
const OPTIONS = {
    distDir: DIST_DIR,

    browserifyConfig: {
        entries: 'app/js/algobuy.jsx',
        basedir: '.',
        paths: './app/js',
        extensions: ['js', 'jsx']
    },

    js: {
        bundleName: 'algobuy.js',
        destDir: `${DIST_DIR}/js`
    },

    sass: {
        source: 'app/styles/main.scss',
        bundleName: 'main.css',
        destDir: `${DIST_DIR}/css`
    }
};


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


// BUILDING TASKS
gulp.task('build', ['lint', 'js-build', 'scss-build', 'assets-copy']);

gulp.task('js-build', () => {
    var bundler = browserify(OPTIONS.browserifyConfig);

    bundler.on('error', errorHandler);

    // Use babelify to transpile our ES6 files to ES5
    bundler.transform(babelify);

    // Bundle our js code
    bundler.bundle()
        .pipe(source(OPTIONS.js.bundleName))
        .pipe(buffer())

        // Generate sourcemaps
        .pipe(sourcemaps.init({ loadMaps: true }))

        // For production build, run uglify on the bundled js
        .pipe(gulpif(argv.production, uglify({ mangle: false })))
        .on('error', errorHandler)

        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(OPTIONS.js.destDir));
});

gulp.task('scss-build', () => {
    gulp.src(OPTIONS.sass.source)
        .pipe(rename(OPTIONS.sass.bundleName))

        // Generate sourcemaps
        .pipe(sourcemaps.init())

        .pipe(sass().on('error', errorHandler))

        // For production build, minify css
        .pipe(gulpif(argv.production, minifyCss()))
        .on('error', errorHandler)

        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(OPTIONS.sass.destDir));
});

gulp.task('assets-copy', () => {
    // Simply copy all assets to the destination directory
    gulp.src('app/assets/**/*').pipe(gulp.dest(OPTIONS.distDir))
});


function errorHandler(error)
{
    util.log(util.colors.red('!! Error: ' + error.message));
    this.end();
}
