/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		meta: {
			version: '0.0.1',
			banner: '/* golly.js : v<%= meta.version %> on ' +
				'<%= grunt.template.today("mm/dd/yyyy") %>\n' +
				'* http://dannyx0.github.com/golly/\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
				'Danny Garcia; Licensed MIT */'
		},
		lint: {
			files: ['grunt.js', 'src/**/*.js']
		},
		qunit: {
			files: ['test/**/*.html']
		},
		concat: {
			dist: {
				src: ['<banner:meta.banner>', '<file_strip_banner:src/golly.js>'],
				dest: 'dist/golly.js'
			}
		},
		min: {
			dist: {
				src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
				dest: 'dist/golly.min.js'
			}
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'lint qunit'
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true
			},
			globals: {
				jQuery: true
			}
		},
		uglify: {},
		server: {
			port: 8000,
			base: '.'
		}
	});

	// Default task.
	grunt.registerTask('default', 'lint qunit concat min');

};
