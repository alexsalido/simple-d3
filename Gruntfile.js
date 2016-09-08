var child_process = require('child_process');

module.exports = function(grunt) {

    var localConfig;

    try {
        localConfig = require('./server/local.env');
    } catch (e) {
        localConfig = {};
    }


    grunt.initConfig({
        env: {
            all: localConfig
        },
        express: {
            options: {
                port: process.env.PORT || 9000
            },
            dev: {
                options: {
                    script: './app.js',
                }
            }
        },
        watch: {
            server: {
                files: ['server/**/*.js', 'app.js'],
                tasks: ['express:dev'],
                options: {
                    spawn: false
                }
            },
        }
    });

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');

    var child_express_app;

    grunt.registerTask('default', function(target) {
        grunt.task.run(['env:all', 'express:dev', 'watch:server']);
    });

    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln('Restarting Express Server');
    });
};
