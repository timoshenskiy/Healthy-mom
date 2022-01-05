const gulp = require('gulp')
const gulpPug = require('gulp-pug')
const sass = require('gulp-sass')(require('sass'))
const rename = require('gulp-rename')
const cleanCSS = require('gulp-clean-css')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const imageMin = require('gulp-imagemin')
const size = require('gulp-size')
const newer = require('gulp-newer')
const del = require('del')
const browserSync = require('browser-sync').create();

const paths = {
    pug: {
        src: 'src/*.pug',
        dest: 'dist/'
    },
    styles: {
        src: ['src/styles/**/*.sass', 'src/styles/**/*.css'],
        dest: 'dist/css/'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'dist/js/'
    },
    images: {
        src: 'src/img/**',
        dest: 'dist/img/',
    }
}

function clean() {
    return del(['dist/*', '!dist/img'])
}

function pug() {
    return gulp.src(paths.pug.src)
        .pipe(gulpPug())
        .pipe(size())
        .pipe(gulp.dest(paths.pug.dest))
        .pipe(browserSync.stream())
}

function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(concat('main.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(size())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream())
}

function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(size())
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream())
}

function img() {
    return gulp.src(paths.images.src)
        .pipe(newer(paths.images.dest))
        .pipe(imageMin({
            progressive: true,
        }))
        .pipe(size())
        .pipe(gulp.dest(paths.images.dest))
}

function watch() {
    browserSync.init({
        server: {
            baseDir: './dist/'
        }
    })
    gulp.watch(paths.pug.src).on('change', browserSync.reload)
    gulp.watch(paths.pug.src, gulp.series('pug'))
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.scripts.src, scripts)
    gulp.watch(paths.images.src, img)
}

const build = gulp.series(
    clean,
    gulp.parallel(pug, styles, scripts, img),
    watch
)

exports.clean = clean
exports.pug = pug
exports.img = img
exports.styles = styles
exports.scripts = scripts
exports.watch = watch
exports.build = build
exports.default = build
