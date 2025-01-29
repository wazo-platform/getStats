'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt, {
        pattern: 'grunt-*',
        config: 'package.json',
        scope: 'devDependencies'
    });

    var versionNumber = grunt.file.readJSON('package.json').version;

    var banner = '\'use strict\';\n\n';

    banner += '// Last time updated: <%= grunt.template.today("UTC:yyyy-mm-dd h:MM:ss TT Z") %>\n\n';

    banner += '// _______________\n';
    banner += '// getStats v' + versionNumber + '\n\n';

    banner += '// Open-Sourced: https://github.com/muaz-khan/getStats\n\n';

    banner += '// --------------------------------------------------\n';
    banner += '// Muaz Khan     - www.MuazKhan.com\n';
    banner += '// MIT License   - www.WebRTC-Experiment.com/licence\n';
    banner += '// --------------------------------------------------\n\n';

    // configure project
    grunt.initConfig({
        // make node configurations available
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                stripBanners: true,
                separator: '\n',
                banner: banner
            },
            dist: {
                src: [
                    'dev/head.js',
                    'dev/amd.js',
                    'dev/globals.js',
                    'dev/parameters.js',
                    'dev/getStats.js',
                    'dev/wrapper.js',
                    'dev/datachannel.js',
                    'dev/googCertificate.js',
                    'dev/googCodecName.audio.js',
                    'dev/googCodecName.video.js',
                    'dev/bweforvideo.js',
                    'dev/candidate-pair.js',
                    'dev/local-candidate.js',
                    'dev/remote-candidate.js',
                    'dev/dataSentReceived.js',
                    'dev/inbound-rtp.js',
                    'dev/outbound-rtp.js',
                    'dev/track.js',
                    'dev/ssrc.js',
                    'dev/tail.js'
                ],
                dest: 'getStats.js',
            },
        },
        uglify: {
            options: {
                mangle: false,
                banner: banner
            },
            my_target: {
                files: {
                    'getStats.min.js': ['getStats.js']
                }
            }
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'v%VERSION%',
                commitFiles: ['package.json', 'bower.json'],
                createTag: true,
                tagName: '%VERSION%',
                tagMessage: '%VERSION%',
                push: false,
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },
        watch: {
            scripts: {
                files: ['dev/*.js'],
                tasks: ['concat', 'uglify'],
                options: {
                    spawn: false,
                },
            }
        }
    });

    // enable plugins

    // set default tasks to run when grunt is called without parameters
    // http://gruntjs.com/api/grunt.task
    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.loadNpmTasks('grunt-contrib-watch');
};
