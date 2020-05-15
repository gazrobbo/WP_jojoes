/**
 * Gulpfile.
 *
 * Gulp with WordPress.
 *
 * Implements:
 *      1. Live reloads browser with BrowserSync.
 *      2. CSS: Sass to CSS conversion, error catching, Autoprefixing, Sourcemaps,
 *         CSS minification, and Merge Media Queries.
 *      3. JS: Concatenates & uglifies Vendor and Custom JS files.
 *      4. Images: Minifies PNG, JPEG, GIF and SVG images.
 *      5. Watches files for changes in CSS or JS.
 *      6. Watches files for changes in PHP.
 *      7. Corrects the line endings.
 *      8. InjectCSS instead of browser page reload.
 *      9. Generates .pot file for i18n and l10n.
 *
 * @tutorial https://github.com/ahmadawais/WPGulp
 * @author Ahmad Awais <https://twitter.com/MrAhmadAwais/>
 */

/**
 * Load WPGulp Configuration.
 *
 * TODO: Customize your project in the wpgulp.js file.
 */
const config = require( './wpgulp.config.js' );
/**
 * Load Plugins.
 *
 * Load gulp plugins and passing them semantic names.
 */
//const gulp = require( 'gulp' ); // Gulp of-course.
const { series, parallel, src, dest, lastRun, watch } = require('gulp');


// CSS related plugins.
const sass = require( 'gulp-sass' ); // Gulp plugin for Sass compilation.
const minifycss = require( 'gulp-clean-css' ); // Minifies CSS files.
const autoprefixer = require( 'gulp-autoprefixer' ); // Autoprefixing magic.


const postcssPresetEnv = require('postcss-preset-env');
const postcss = require( 'gulp-postcss' ); // postCSS magic.
const urlAdjuster = require('gulp-css-url-adjuster');
const mmq = require( 'gulp-merge-media-queries' ); // Combine matching media queries into one.
const rtlcss = require( 'gulp-rtlcss' ); // Generates RTL stylesheet.

// JS related plugins.
const concat = require( 'gulp-concat' ); // Concatenates JS files.
const uglify = require( 'gulp-uglify' ); // Minifies JS files.
const babel = require( 'gulp-babel' ); // Compiles ESNext to browser compatible JS.

// Image related plugins.
const imagemin = require( 'gulp-imagemin' ); // Minify PNG, JPEG, GIF and SVG images with imagemin.


// Utility related plugins.
const rename = require( 'gulp-rename' ); // Renames files E.g. style.css -> style.min.css.
const lineec = require( 'gulp-line-ending-corrector' ); // Consistent Line Endings for non UNIX systems. Gulp Plugin for Line Ending Corrector (A utility that makes sure your files have consistent line endings).
const filter = require( 'gulp-filter' ); // Enables you to work on a subset of the original files by filtering them using a glob.
const sourcemaps = require( 'gulp-sourcemaps' ); // Maps code in a compressed file (E.g. style.css) back to it’s original position in a source file (E.g. structure.scss, which was later combined with other css files to generate style.css).
const notify = require( 'gulp-notify' ); // Sends message notification to you.
const browserSync = require( 'browser-sync' ).create(); // Reloads browser and injects CSS. Time-saving synchronized browser testing.
const wpPot = require( 'gulp-wp-pot' ); // For generating the .pot file.
const sort = require( 'gulp-sort' ); // Recommended to prevent unnecessary changes in pot-file.
const cache = require( 'gulp-cache' ); // Cache files in stream for later use.
const remember = require( 'gulp-remember' ); //  Adds all the files it has ever seen back into the stream.
const plumber = require( 'gulp-plumber' ); // Prevent pipe breaking caused by errors from gulp plugins.
const beep = require( 'beepbeep' );
const touch = require('gulp-touch-fd');

/**
 * Custom Error Handler.
 *
 * @param Mixed err
 */
const errorHandler = r => {
	notify.onError( '\n\n❌  ===> ERROR: <%= error.message %>\n' )( r );
	beep();

	// this.emit('end');
};

/**
 * Task: `browser-sync`.
 *
 * Live Reloads, CSS injections, Localhost tunneling.
 * @link http://www.browsersync.io/docs/options/
 *
 * @param  done Done.
 */
function browsersync(done){
	browserSync.init({
		proxy: config.projectURL,
		open: config.browserAutoOpen,
		injectChanges: config.injectChanges,
		watchEvents: [ 'change', 'add', 'unlink', 'addDir', 'unlinkDir' ]
	});
	done();
}

// Helper function to allow browser reload with Gulp 4.
function reload(done){
	browserSync.reload();
	done();
}


const processors = [
	postcssPresetEnv()
];


/**
 * Task: `TemplatePartStyles`
 * Template Part concat Sass Styles from template part folder and inc folder
 */
function templatePartStyles(){
	return src(config.otherStyles, { allowEmpty: true })
		.pipe( concat( config.otherStylesFiles + '.scss' ) )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( dest( config.otherStylesDestination ) )
		.pipe(touch());
}


/**
 * Task: `styles`.
 *
 * Compiles Sass, Autoprefixes it and Minifies CSS.
 *
 * This task does the following:
 *    1. Gets the source scss file
 *    2. Compiles Sass to CSS
 *    3. Writes Sourcemaps for it
 *    4. Autoprefixes it and generates style.css
 *    5. Renames the CSS file with suffix .min.css
 *    6. Minifies the CSS file and generates style.min.css
 *    7. Injects CSS or reloads the browser via browserSync
 */

function styles(){

	return src( config.styleSRC, { allowEmpty: true, sourcemaps: true })
		.pipe( plumber( errorHandler ) )
		//.pipe( sourcemaps.init() )
		.pipe(
			sass({
				errLogToConsole: config.errLogToConsole,
				outputStyle: config.outputStyle,
				precision: config.precision
			})
		)
		.on( 'error', sass.logError )
		.pipe(postcss(processors))
		.pipe( autoprefixer( config.BROWSERS_LIST ) )
		.pipe(touch())
		.pipe(urlAdjuster({
			prependRelative: '../',
		}))
		//.pipe( filter( '**/*.css' ) ) // Filtering stream to only css files.
		//.pipe( mmq({ log: true }) ) // Merge Media Queries only for .min.css version.
		.pipe( browserSync.stream() ) // Reloads style.css if that is enqueued.
		//.pipe( sourcemaps.write() )
		.pipe( dest( config.styleDestination, { sourcemaps: true} ) )
		.pipe( rename({ suffix: '.min' }) )
		.pipe( minifycss({sourcemaps: true}) )

		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		//.pipe( sourcemaps.write({loadMaps: true}) )
		.pipe( dest( config.styleDestination, { sourcemaps: true} ) )
		.pipe(touch())
		.pipe( filter( '**/*.css' ) ) // Filtering stream to only css files.
		.pipe( browserSync.stream() ) // Reloads style.min.css if that is enqueued.
		.pipe( notify({ message: '\n\n✅  ===> STYLES — completed!\n', onLast: true }) );
}

/**
 * Task: `stylesRTL`.
 *
 * Compiles Sass, Autoprefixes it, Generates RTL stylesheet, and Minifies CSS.
 *
 * This task does the following:
 *    1. Gets the source scss file
 *    2. Compiles Sass to CSS
 *    4. Autoprefixes it and generates style.css
 *    5. Renames the CSS file with suffix -rtl and generates style-rtl.css
 *    6. Writes Sourcemaps for style-rtl.css
 *    7. Renames the CSS files with suffix .min.css
 *    8. Minifies the CSS file and generates style-rtl.min.css
 *    9. Injects CSS or reloads the browser via browserSync
 */
function stylesRTL(){
	return src( config.styleSRC, { allowEmpty: true })
		.pipe( plumber( errorHandler ) )
		.pipe( sourcemaps.init() )
		.pipe(
			sass({
				errLogToConsole: config.errLogToConsole,
				outputStyle: config.outputStyle,
				precision: config.precision
			})
		)
		.on( 'error', sass.logError )
		.pipe( sourcemaps.write({ includeContent: false }) )
		.pipe( sourcemaps.init({ loadMaps: true }) )
		.pipe( autoprefixer( config.BROWSERS_LIST ) )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( rename({ suffix: '-rtl' }) ) // Append "-rtl" to the filename.
		.pipe( rtlcss() ) // Convert to RTL.
		.pipe( sourcemaps.write( './' ) ) // Output sourcemap for style-rtl.css.
		.pipe( dest( config.styleDestination ) )
		.pipe( filter( '**/*.css' ) ) // Filtering stream to only css files.
		.pipe( browserSync.stream() ) // Reloads style.css or style-rtl.css, if that is enqueued.
		//.pipe( mmq({ log: true }) ) // Merge Media Queries only for .min.css version.
		.pipe( rename({ suffix: '.min' }) )
		.pipe( minifycss({ maxLineLen: 10 }) )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( dest( config.styleDestination ) )
		.pipe( filter( '**/*.css' ) ) // Filtering stream to only css files.
		.pipe( browserSync.stream() ) // Reloads style.css or style-rtl.css, if that is enqueued.
		.pipe( notify({ message: '\n\n✅  ===> STYLES RTL — completed!\n', onLast: true }) );
}

/**
 * Task: `vendorsJS`.
 *
 * Concatenate and uglify vendor JS scripts.
 *
 * This task does the following:
 *     1. Gets the source folder for JS vendor files
 *     2. Concatenates all the files and generates vendors.js
 *     3. Renames the JS file with suffix .min.js
 *     4. Uglifes/Minifies the JS file and generates vendors.min.js
 */
function vendorsJS(){
	return src( config.jsVendorSRC, { since: lastRun( vendorsJS ) }) // Only run on changed files.
		.pipe( plumber( errorHandler ) )
		.pipe(
			babel({
				presets: [
					[
						'@babel/preset-env', // Preset to compile your modern JS to ES5.
						{
							targets: { browsers: config.BROWSERS_LIST } // Target browser list to support.
						}
					]
				]
			})
		)
		.pipe( remember( config.jsVendorSRC ) ) // Bring all files back to stream.
		.pipe( concat( config.jsVendorFile + '.js' ) )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( dest( config.jsVendorDestination ) )
		.pipe(
			rename({
				basename: config.jsVendorFile,
				suffix: '.min'
			})
		)
		.pipe( uglify() )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( dest( config.jsVendorDestination ) )
		.pipe( notify({ message: '\n\n✅  ===> VENDOR JS — completed!\n', onLast: true }) );
}




/**
 * Task: `customJS`.
 *
 * Concatenate and uglify custom JS scripts.
 *
 * This task does the following:
 *     1. Gets the source folder for JS custom files
 *     2. Concatenates all the files and generates custom.js
 *     3. Renames the JS file with suffix .min.js
 *     4. Uglifes/Minifies the JS file and generates custom.min.js
 */
function customJS(){
	return src( [config.jsCustomSRC, config.incScripts, config.templatePartsScripts], { sourcemaps: true }) // Only run on changed files.
		.pipe( plumber( errorHandler ) )
		.pipe(
			babel({
				//plugins: ['@babel/transform-runtime'],
				presets: [
					[
						'@babel/preset-env', // Preset to compile your modern JS to ES5.
						{
							targets: { browsers: config.BROWSERS_LIST } // Target browser list to support.
						}
					]
				]
			})
		)
		.pipe( remember( config.jsCustomSRC ) ) // Bring all files back to stream.
		.pipe( concat( config.jsCustomFile + '.js' ) )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( dest( config.jsCustomDestination, { sourcemaps: true} ))
		.pipe(touch())
		.pipe(
			rename({
				basename: config.jsCustomFile,
				suffix: '.min'
			})
		)
		.pipe( uglify() )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( dest( config.jsCustomDestination , { sourcemaps: true} ))
		.pipe( notify({ message: '\n\n✅  ===> CUSTOM JS — completed!\n', onLast: true }) );
}


/**
 * Task: `noConcatJS`.
 *
 * Uglifies and makes a min js file of script files not meant to go into custom.js
 *
 * This task does the following:
 *     1. Gets the source folder for JS  files NOT to be concatenated
 *     2. Renames the JS file with suffix .min.js
 */
function noConcatJS(){
	return src( config.noConcatScripts, { since: lastRun( noConcatJS ),  sourcemaps: true }) // Only run on changed files.
		.pipe( plumber( errorHandler ) )
		.pipe(
			babel({
				//plugins: ['@babel/transform-runtime'],
				presets: [
					[
						'@babel/preset-env', // Preset to compile your modern JS to ES5.
						{
							targets: { browsers: config.BROWSERS_LIST } // Target browser list to support.
						}
					]
				]
			})
		)
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( dest( config.jsCustomDestination, { sourcemaps: true} ) )
		.pipe(touch())
		.pipe(
			rename({
				//basename: config.jsCustomFile,
				suffix: '.min'
			})
		)
		.pipe( uglify() )
		.pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
		.pipe( dest( config.jsCustomDestination, { sourcemaps: true} ) )
		.pipe( notify({ message: '\n\n✅  ===> No Concat JS — completed!\n', onLast: true }) );
}

/**
 * Task: `images`.
 *
 * Minifies PNG, JPEG, GIF and SVG images.
 *
 * This task does the following:
 *     1. Gets the source of images raw folder
 *     2. Minifies PNG, JPEG, GIF and SVG images
 *     3. Generates and saves the optimized images
 *
 * This task will run only once, if you want to run it
 * again, do it with the command `gulp images`.
 *
 * Read the following to change these options.
 * @link https://github.com/sindresorhus/gulp-imagemin
 */
function images(){
	return src( config.imgSRC )
		.pipe(
			cache(
				imagemin([
					imagemin.gifsicle({ interlaced: true }),
					imagemin.mozjpeg({ progressive: true }),
					imagemin.optipng({ optimizationLevel: 3 }), // 0-7 low-high.
					imagemin.svgo({
						plugins: [ { removeViewBox: true }, { cleanupIDs: false } ]
					})
				])
			)
		)
		.pipe( dest( config.imgDST ) )
		.pipe( notify({ message: '\n\n✅  ===> IMAGES — completed!\n', onLast: true }) );
}

/**
 * Task: `clear-images-cache`.
 *
 * Deletes the images cache. By running the next "images" task,
 * each image will be regenerated.
 */
function clearCache( done ) {
	return cache.clearAll( done );
}

/**
 * WP POT Translation File Generator.
 *
 * This task does the following:
 * 1. Gets the source of all the PHP files
 * 2. Sort files in stream by path or any custom sort comparator
 * 3. Applies wpPot with the variable set at the top of this file
 * 4. Generate a .pot file of i18n that can be used for l10n to build .mo file
 */
function translate(){
	return src( config.watchPhp )
		.pipe( sort() )
		.pipe(
			wpPot({
				domain: config.textDomain,
				package: config.packageName,
				bugReport: config.bugReport,
				lastTranslator: config.lastTranslator,
				team: config.team
			})
		)
		.pipe( dest( config.translationDestination + '/' + config.translationFile ) )
		.pipe( notify({ message: '\n\n✅  ===> TRANSLATE — completed!\n', onLast: true }) );
}

/**
 * Watch Tasks.
 *
 * Watches for file changes and runs specific tasks.
 */

function watchFiles(){
	watch( config.watchPhp, series(translate, reload ) ); // Reload on PHP file changes.
	watch( config.otherStyles, series( templatePartStyles) ); // concat styles from other folders, this in turn calls the styles watch below
	watch( config.watchStyles, series(styles, reload ) ); // Reload on SCSS file changes.
	watch( config.watchJsVendor, series( vendorsJS, reload ) ); // Reload on vendorsJS file changes.
	watch( config.watchJsCustom, series(customJS, reload ) ); // Reload on customJS file changes.
	watch( config.watchNoConcatScripts, series(noConcatJS, reload ) ); // Reload on customJS file changes.
	watch( config.imgSRC, series( images, reload ) ); // Reload on customJS file changes.
}

exports.default = series(templatePartStyles, styles, vendorsJS, customJS, noConcatJS, images,  browsersync, watchFiles);
exports.build = series(templatePartStyles, styles, vendorsJS, customJS, noConcatJS, images);


