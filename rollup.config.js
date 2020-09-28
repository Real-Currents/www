import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import svelte from 'rollup-plugin-svelte';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';
// import del from 'rollup-plugin-delete';
import json from 'rollup-plugin-json';
import livereload from 'rollup-plugin-livereload';
import resolve from 'rollup-plugin-node-resolve';
import postcss from "rollup-plugin-postcss";
import shader from 'rollup-plugin-shader';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
	{
		input: 'src/main.js',
		output: {
			sourcemap: true,
			format: 'iife',
			name: 'app',
			exports: 'named',
			file: 'public/main.js'
		},
		plugins: [
			postcss({
				extract: 'public/global.css',
				plugins: []
			}),

			commonjs(),

			// del({
			// 	targets: [
			// 		'public/fonts',
			// 		'public/images',
			// 		'public/libs',
			// 		'public/scripts',
			// 		'public/styles'
			// 	],
			// 	verbose: true
			// }),

			copy({
				targets: [
					{ src: 'content/js-demos/data', dest: 'public/' },
					{ src: 'content/js-demos/images', dest: 'public/' },
					{ src: 'content/js-demos/scripts', dest: 'public/' },
					{ src: 'content/js-demos/stymaps', dest: 'public/' },
					{ src: 'src/images', dest: 'public/' },
					{ src: 'src/styles/imports', dest: 'public/' }
				]
			}),

			json(),

			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration -
			// consult the documentation for details:
			// https://github.com/rollup/plugins/tree/master/packages/commonjs
			resolve({
				browser: true,
				dedupe: ['svelte']
			}),

			svelte({
				// enable run-time checks when not in production
				dev: !production,
				// we'll extract any component CSS out into
				// a separate file - better for performance
				css: css => {
					css.write('public/main.css');
				}
			}),

			shader( {
				// All match files will be parsed by default,
				// but you can also specifically include/exclude files
				include: [
					'../@sveltejs/gl/**/*.glsl',
					'**/*.glsl',
					'**/*.vs',
					'**/*.fs' ],
				// specify whether to remove comments
				removeComments: true,   // default: true
			} ),

			// In dev mode, call `npm run start` once
			// the bundle has been generated
			!production && serve(),

			// Watch the `public` directory and refresh the
			// browser on changes when not in production
			!production && livereload('public'),

			// If we're building for production (npm run build
			// instead of npm run dev), minify
			production && terser()
		],
		watch: {
			clearScreen: false
		}
	},
	{
		input: 'src/event-processor.js',
		output: {
			sourcemap: true,
			name: 'self',
			format: 'umd',
			extend: true,
			exports: 'named',
			file: 'public/worker.js'
		},
		plugins: [
			commonjs(),

			resolve({
				browser: true
			})
		],
		watch: {
			clearScreen: false
		}
	},
	{
		input: 'src/invoice-service.js',
		output: {
			dir: 'dist',
			format: 'umd',
			name: 'self',
			exports: 'named',
			extend: true
		},
		plugins: [
			resolve({
				browser: true
			}),

			builtins(),

			globals(),

			commonjs(),

			json()
		],
		watch: {
			clearScreen: false
		}
	}
];

function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}
