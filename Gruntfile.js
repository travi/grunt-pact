'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    clean: {
    },

    pact: {
      default: {
      },
      withOptions: {
        options: {
          port:9000
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['pact', 'nodeunit', 'pact:default:stop', 'pact:withOptions:stop']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['test']);

};