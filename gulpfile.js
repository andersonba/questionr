var gulp = require('gulp');
var gutil = require('gulp-util');

// package.json
var pkg = require('./package.json');

// plugins
var concat = require('gulp-concat');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var map = require('map-stream');

// reporter (jshint)
var reporter = map(function(file, cb) {
    if (!file.jshint.success) {
        gutil.log(gutil.colors.yellow.bgRed('JSHint fail in ' + file.path));

        file.jshint.results.forEach(function(err) {
            if (err)
                gutil.log(gutil.colors.red(' ' + file.path + ': line ' + err.line + ', col ' + err.character + ', code ' + err.code + ', ' + err.reason));
        });
    }

    if (file.jshint.errorCount !== undefined)
        gutil.log(gutil.colors.green('Your project have ' + file.jshint.errorCount + ' errors...'));
    else
        gutil.log(gutil.colors.green(' -- Your project no have errors...'));

    cb(null, file);
});

// tasks
gulp.task('build', function() {
    // minify and jshint
    var scriptFile = './js/questionr.js';
    var scriptDist = './js';

    gulp.src(scriptFile)
        .pipe(concat('questionr.min.js'))
        .pipe(jshint())
        .pipe(uglify())
        .pipe(gulp.dest(scriptDist));


    // less
    var lessFiles = './less/**/*';
    var lessDist = './css';

    gulp.src(lessFiles)
        .pipe(concat('all.min.less'))
        .pipe(less())
        .pipe(gulp.dest(lessDist));
});

// default task (called when run `gulp`)
gulp.task('default', ['build']);
