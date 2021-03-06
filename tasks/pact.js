'use strict';

var pact = require('@pact-foundation/pact-node'),
	_ = require('underscore'),
	path = require('path');

var targets = {};

module.exports = function (grunt) {

	grunt.registerMultiTask('pact', 'A grunt task to run pact', function (arg) {
		arg = arg || 'start'; // Default subtask to start
		var done = this.async();
		var options = this.options({
			logLevel: 'info'
		});
		options.logLevel = grunt.option('verbose') ? 'debug' : options.logLevel;
		var files = this.files;

		pact.logLevel(options.logLevel);
		if (!targets[this.target]) {
			targets[this.target] = pact.createServer(options);
		}

		switch (arg) {
			case 'start':
				targets[this.target].start().then(function (server) {
					grunt.log.ok('Pact started on port ' + server.options.port);

					// Go through each files and call it with the server instance
					_.each(files, function (f) {
						_.each(f.src, function (file) {
							try {
								var func = require(path.resolve(file));
								grunt.verbose.writeln('Including pact file `' + file + '`');
								if (_.isFunction(func)) {
									func(server);
								}
							} catch (e) {
								if (options.force) {
									grunt.log.error('Grunt-pact could not include file `' + file + '` because of error, Force detected, Skipping over.\n' + e.stack);
								} else {
									grunt.fail.warn('Grunt-pact could not include file `' + file + '` because of error.\n' + e.stack);
								}
							}
						});
					});

					grunt.log.ok('Done including Pact files.');
					done();
				}, function(err){
					grunt.log.error(err);
					done();
				});
				break;
			case 'stop':
				targets[this.target].stop().then(function (server) {
					grunt.log.ok('Pact stopped on port ' + server.options.port);
					done();
				}, function(err){
					grunt.log.error(err);
					done();
				});
				break;
			case 'restart':
				grunt.task.run(['pact:' + this.target + ':stop', 'pact:' + this.target + ':start']);
				done();
				break;
		}
	});

	process.on('exit', function () {
		for (var target in targets) {
			grunt.task.run('pact:' + target + ':stop');
		}
	});
};
