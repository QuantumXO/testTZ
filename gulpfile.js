'use strict';

const gulp           		  = require('gulp'),
	gulpLoadPlugins		  = require('gulp-load-plugins'),
	browserSync    		  = require("browser-sync"),
	argv           		  = require('yargs').argv,
	imageminJpegRecompress  = require('imagemin-jpeg-recompress'),
	imageminPngquant 		  = require('imagemin-pngquant'),
	//htmlInclude 		  = require('gulp-htm-include'),
	plugin                  = gulpLoadPlugins();

const isProduction = argv.prod ? true : false;
const env = isProduction ? 'production' : 'develop';
const debug = isProduction ? false : true;

const versionConfig = {
	'value' : '%MDS%',
	'append': {
		'to': [
			{
				'type'  : 'css',
				'key': 'v',
				files : [/\.\/css\//]
			},
			{
				'type'  : 'js',
				'key': 'v',
				files : [/\.\/js\//]
			}
		],
	}
};

// Paths
const dest = 'dist/',
	cleanDir = 'dist/',
	src = '',
	path = {
		build: {
			page:   dest,
			styles: dest + 'css',
			fonts:  dest + 'fonts',
			img:    dest + 'img',
			js:     dest + 'js',
			jsMin:  dest + 'js'
		},
		watch: {
			page:   'modules/**/*.+(html|php)',
			sass:   'styles/**/*.sass',
			css:    'css/**/*.css',
			fonts:  'fonts/*',
			img:    'images/**/*',
			js:     'js/**/*.js',
			jsMin:  'js/**/*.+(min.js)'
		},
		assets: {
			page:   'modules/**/*.+(html|php)',
			style:  'styles/*.sass',
			css:    'css/**/*.css',
			fonts:  'fonts/*',
			img:    'images/**/*',
			js:     'js/**/*.js',
			jsMin:  'js/**/*.min.js'
		}
	};

// PAGE
function page() {
	return gulp.src([path.assets.page, '!modules/blocks/**/*'])
	//.pipe(plugin.changed(path.build.page))
		.pipe(plugin.fileInclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(plugin.preprocess({ context: { NODE_ENV: env, DEBUG: debug } })) // To set environment variables in-line
		.pipe(plugin.if(isProduction, plugin.htmlmin({
			collapseWhitespace: true,
			minifyURLs: true,
			removeComments: true,
			continueOnParseError: true,
		})))
		.pipe(plugin.if(isProduction, plugin.versionNumber(versionConfig)))
		.pipe(gulp.dest(dest))
		.pipe(browserSync.reload({ stream:true }));
}

// Стили
function styles() {
	return gulp.src(path.assets.style)
		.pipe(plugin.changed(path.build.styles))
		//.pipe(sourcemaps.init())
		.pipe(plugin.sass().on( 'error', plugin.notify.onError(
			{message: "<%= error.message %>",
				title  : "Sass Error!"})))
		.pipe(plugin.if(isProduction, plugin.autoprefixer({ cascade: false })))
		.pipe(gulp.dest(path.build.styles))
		//.pipe(plugin.cssRebaseUrls())
		.pipe(plugin.if(isProduction, plugin.cleancss()))
		//.pipe(sourcemaps.write())
		.pipe(plugin.if(isProduction, plugin.criticalCss()))
		.pipe(plugin.if(isProduction, plugin.rename({suffix: '.min'})))
		.pipe(plugin.if(isProduction, gulp.dest(path.build.styles)))
		.pipe(browserSync.reload({stream:true}));
}

// Конвертируем шрифты в base64
function fc() {
	return gulp.src([path.assets.fonts + '*.{woff,woff2}'])
		.pipe(plugin.if(isProduction, plugin.cssfont64()))
		.pipe(plugin.if(isProduction, gulp.dest(path.build.styles)))
}

// fonts
function fonts() {
	return gulp.src(path.assets.fonts)
		.pipe(gulp.dest(path.build.fonts));
}

// src css
function css() {
	return gulp.src(path.assets.css)
		.pipe(plugin.changed(path.build.styles))
		.pipe(gulp.dest(path.build.styles));
}

// Скрипты js
function js() {
	return gulp.src([path.assets.js, '!js/**/*.min.js'])
		.pipe(plugin.changed(path.build.js))
		//.pipe(concat('main.js'))
		//.pipe(plugin.rename({ suffix: '.min' }))
		.pipe(gulp.dest(path.build.js))
		.pipe(plugin.if(isProduction, plugin.uglify({
			compress: true,
			warnings: true,
		}).on( 'error', plugin.notify.onError({ message: "<%= error.message %>", title  : "JS Error!" }))))
		.pipe(plugin.if(isProduction, plugin.rename({ suffix: '.min' })))
		.pipe(plugin.if(isProduction, gulp.dest(path.build.js)))
		.pipe(browserSync.reload({stream:true}));
}

// Скрипты jsMin
function jsMin() {
	return gulp.src(path.assets.jsMin)
		.pipe(plugin.changed(path.build.jsMin))
		.pipe(gulp.dest(path.build.jsMin));
}

// Img
function img() {
	return gulp.src(path.assets.img)
		.pipe(plugin.if(!isProduction, plugin.changed(path.build.img)))
		//.pipe(plugin.if(isProduction, plugin.cache(plugin.imagemin({optimizationLevel:5,progressive:true,interlaced:true}))))
		.pipe(plugin.if(isProduction, plugin.cache(plugin.imagemin([
			plugin.imagemin.gifsicle({interlaced:true}),
			plugin.imagemin.svgo({plugins: [{removeViewBox:false}]}),
			//imageminPngquant({quality: '75-85'}),
			imageminJpegRecompress({progressive:true, max:80,min:75}),
		]))))
		.pipe(gulp.dest(path.build.img))
		.pipe(browserSync.reload({stream:true}));
}

// Очистка
function clean() {
	return gulp.src(cleanDir, {read: false})
		.pipe(plugin.clean());
}

// zip
function zipFunc() {
	return gulp.src(dest)
		.pipe(plugin.zip('archive.zip'))
		.pipe(gulp.dest(dest));
}

// Proxy connect
function browserSyncFunc(){
	browserSync.init({
		server: {
			baseDir: "./dist"
		},
		tunnel: false,
		host: 'localhost',
		port: 3000,
		notify: true,
		open: false
	});
}

// Наблюдение Watch
function watch() {
	// Наблюдение за .sass файлами
	gulp.watch(path.watch.sass, styles);
	// Наблюдение за .js файлами
	gulp.watch(path.watch.js, js);
	// Наблюдение за .min.js файлами
	gulp.watch(path.watch.jsMin, jsMin);
	// Наблюдение за img файлами
	gulp.watch(path.watch.img, img);
	// Наблюдение за fonts файлами
	gulp.watch(path.watch.fonts, fonts);
	gulp.watch(path.watch.css, css);
	// Наблюдение за fonts файлами
	gulp.watch(path.watch.page, page);
}

gulp.task('clean', clean);

// Задача по-умолчанию
if(!isProduction){ // Dev
	gulp.task('default', gulp.parallel(styles, fonts, img, page, js, jsMin, css, fc, browserSyncFunc, watch));
}else{
	gulp.task('default', gulp.series('clean', gulp.parallel(styles, fonts, img, page, js, jsMin, css, fc)));
}

