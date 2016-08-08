var gulp       = require('gulp');
var $          = require('gulp-load-plugins')();
var _          = require('lodash');
var sync       = $.sync(gulp).sync;
var del        = require('del');
var browserify = require('browserify');
var watchify   = require('watchify');
var source     = require('vinyl-source-stream');
var envify     = require('envify/custom');
var babel      = require('babelify');

require('dotenv').config({silent: true});
var env = process.env.NODE_ENV || 'development';

var config = {
  serverDir: './server',
  publicDir: './server/public',
  appDir: './client'
}

config = _.extend(config, {
  bowerDir: config.appDir + '/bower_components',
  bootstrapDir: config.appDir + '/bower_components/bootstrap-sass'
});

config = _.extend(config, {
  fontList: [
    config.appDir + '/fonts/**/*',
    config.bootstrapDir + '/assets/fonts/**/*'
  ],
  sassList: [
    config.bootstrapDir + '/assets/stylesheets'
  ]
});

var bundler = {
  w: null,
  init: function() {
    var b = browserify({
      entries: [config.appDir + '/scripts/app.js'],
      insertGlobals: true,
      cache: {},
      packageCache: {}
    });
    b.transform(babel, {
      //presets:["es2016", "react"]
    });
    b.transform(envify({
      _: 'purge',
      "WRAP_API_KEY": process.env.WRAP_API_KEY,
      "WRAP_BASE_URL": process.env.WRAP_BASE_URL,
      'WRAP_APP_URL': process.env.WRAP_APP_URL
    }));
    this.w = watchify(b);
  },
  bundle: function() {
    return this.w && this.w.bundle()
      .on('error', $.util.log.bind($.util, 'Browserify Error'))
      .pipe(source('app.js'))
      .pipe(gulp.dest(config.publicDir + '/scripts'));
  },
  watch: function() {
    this.w && this.w.on('update', this.bundle.bind(this));
  },
  stop: function() {
    this.w && this.w.close();
  }
};

gulp.task('styles', function() {
  return gulp.src(config.appDir + '/styles/main.scss')
    .pipe($.sass({
      includePaths: config.sassList,
      loadPath: config.sassList
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest(config.publicDir + '/styles'))
    .pipe($.size());
});

gulp.task('scripts', function() {
  bundler.init();
  return bundler.bundle();
});

gulp.task('html', function() {
  var assets = $.useref.assets();
  return gulp.src(config.appDir + '/*.html')
    .pipe(assets)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest(config.publicDir))
    .pipe($.size());
});

gulp.task('images', function() {
  return gulp.src(config.appDir + '/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(config.publicDir + '/images'))
    .pipe($.size());
});

gulp.task('fonts', function() {
  return gulp.src(config.fontList)
    .pipe(gulp.dest(config.publicDir + '/fonts'))
    .pipe($.size());
});

gulp.task('extras', function () {
  return gulp.src([config.appDir + '/*.txt', config.appDir + '/*.ico'])
    .pipe(gulp.dest(config.publicDir))
    .pipe($.size());
});

gulp.task('serve', function() {
  gulp.src(config.publicDir)
    .pipe($.webserver({
      livereload: true,
      port: 9000
    }));
});

gulp.task('set-production', function() {
  process.env.NODE_ENV = 'production';
});

gulp.task('minify:js', function() {
  return gulp.src(config.publicDir + '/scripts/**/*.js')
    .pipe($.uglify())
    .pipe(gulp.dest(config.publicDir + '/scripts/'))
    .pipe($.size());
});

gulp.task('minify:css', function() {
  return gulp.src(config.publicDir + '/styles/**/*.css')
    .pipe($.minifyCss())
    .pipe(gulp.dest(config.publicDir + '/styles'))
    .pipe($.size());
});

gulp.task('database:create', function(done) {
  var config = require('./knexfile.js');
  var knex   = require('knex')({
    client: config[env].client,
    connection: {
      host: config[env].connection.host,
      user: config[env].connection.user,
      password: config[env].connection.password
    }
  });
  knex.raw('CREATE DATABASE ' + config[env].connection.database);
  done();
});

var dbTask = $.db({
  dialect: 'postgres',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST
});
console.log(dbTask);
gulp.task('db:create', dbTask.create(process.env.DB_DATABASE));
gulp.task('db:drop', dbTask.drop(process.env.DB_DATABASE));

// gulp.task('babel', function() {
//   return gulp.src([
//     './app.js',
//     './views/**/*'
//   ])
//   .pipe(babel())
//   .pipe(gulp.dest('./server'));
// });

gulp.task('minify', ['minify:js', 'minify:css']);

gulp.task('clean', del.bind(null, 'dist'));

gulp.task('bundle', ['html', 'styles', 'scripts', 'images', 'fonts', 'extras']);

gulp.task('clean-bundle', sync(['clean', 'bundle']));

gulp.task('build', ['clean-bundle'], bundler.stop.bind(bundler));

gulp.task('build:production', sync(['set-production', 'build', 'minify']));

gulp.task('serve:production', sync(['build:production', 'serve']));

gulp.task('default', ['build']);

gulp.task('watch', sync(['clean-bundle', 'develop']), function() {
  bundler.watch();
  gulp.watch(config.appDir + '/*.html', ['html']);
  gulp.watch(config.appDir + '/styles/**/*.scss', ['styles']);
  gulp.watch(config.appDir + '/images/**/*', ['images']);
  gulp.watch(config.appDir + '/fonts/**/*', ['fonts']);
});

gulp.task('develop', function () {
  $.livereload.listen();
  $.nodemon({
    script: 'bin/www',
    ext: 'js jade coffee',
    stdout: false,
    ignore: [config.appDir + '/**'],
    nodeArgs: ['--debug'],
    // tasks: ['babel']
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if(/^Express server listening on port/.test(chunk)){
        $.livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('default', [
  'watch'
]);
