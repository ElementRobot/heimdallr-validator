var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    replace = require('replace'),
    meta = require('./package.json'),
    jsdocConfPath = './docs/conf.json',
    jsdocConf = require(jsdocConfPath);

gulp.task('default', ['tests', 'docs'], function(){
    // Hack because gulp wasn't exiting
    setTimeout(process.exit.bind(0));
});

gulp.task('tests', function tests(){
    return gulp.src('./tests/test.js', {read: false})
        .pipe(mocha());
});

gulp.task('docs', function docs(cb) {
    var destination = path.join('docs', meta.name, meta.version);

    // Unfortunately jsdoc doesn't fit well into the gulp paradigm since
    // it only provides a CLI tool.
    jsdocConf.opts.destination = destination;
    jsdocConfStr = JSON.stringify(jsdocConf, null, 2);
    fs.writeFileSync(jsdocConfPath, jsdocConfStr);
    exec('./node_modules/.bin/jsdoc -c ./docs/conf.json -p', function(err, stdout){
        if(stdout) console.log(stdout);
        if(err) return cb(err);
        cb();
    });

    // Update the github-pages redirect
    replace({
        regex: '\'.*\'',
        replacement: '\'' + destination + '/index.html\'',
        paths: ['index.html'],
        recurse: false,
        silent: true
    });
});

gulp.watch(['./lib', 'README.md'], ['tests', 'docs']);


