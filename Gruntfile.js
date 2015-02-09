/**
 * Created by Rem on 10.09.2014.
 */
module.exports = function(grunt) {
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),

        my_files : {
            js  : [

            ],
            css : [
                'src/css/style.css'
            ]
        },

        src  : {
            js  : [
                '<%= bower_concat.all.dest %>',
                '<%= my_files.js %>'
            ],
            css : [
                'bower_components/**/*.css',
                '<%= my_files.css %>',
                '!bower_components/**/*.min.css'
            ]
        },
        dest : {
            js  : 'static/js/<%= pkg.name %>.min.js',
            css : 'static/css/<%= pkg.name %>.min.css'
        },

        concurrent : {
            dev     : ['dev', 'nodemon', 'watch'],
            options : {
                logConcurrentOutput : true
            }
        },

        nodemon : {
            dev : {
                script  : 'server/index.js',
                options : {
                    env   : {
                        "NODE_ENV"    : 'development',
                        "NODE_CONFIG" : 'dev'
                    },
                    watch : ['server'],
                    delay : 300,

                    callback : function(nodemon) {
                        nodemon.on('log', function(event) {
                            console.log(event.colour);
                        });

                        /** Update .rebooted to fire Live-Reload **/
                        nodemon.on('restart', function() {
                            console.log('Server restarted. Waiting for watch...');
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('fs').writeFileSync('.rebooted', 'rebooted');
                            }, 1000);
                        });
                    }
                }
            }
        },

        bower_concat : {
            all : {
                exclude      : [
                    'fontawesome'
                ],
                dependencies : {
                    backbone : 'jquery'
                },
                dest         : 'build/_bower.js',
                bowerOptions : {
                    relative : false
                }
            }
        },

        cssmin : {
            all : {
                options : {
                    banner              : '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */',
                    keepSpecialComments : 0
                },
                files   : [
                    {
                        src  : '<%= src.css %>',
                        dest : '<%= dest.css %>'
                    }
                ]
            }
        },

        uglify : {
            options : {
                banner : '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist    : {
                files : [{
                    expand : true,
                    src    : '<%= src.js %>',
                    dest   : '<%= dest.js %>'
                }]
            }
        },

        concat : {
            js  : {
                src  : '<%= src.js %>',
                dest : '<%= dest.js %>'
            },
            css : {
                src  : '<%= src.css %>',
                dest : '<%= dest.css %>'
            }
        },

        watch : {
            options : {
                livereload : true
            },
            dev_js  : {
                options : {
                    nospawn : true
                },
                files   : ['<%= my_files.js %>'],
                tasks   : ['concat:js']
            },
            dev_css : {
                options : {
                    nospawn : true
                },
                files   : ['<%= my_files.css %>'],
                tasks   : ['concat:css']
            },
            server  : {
                files   : ['.rebooted'],
                options : {
                    nospawn : true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('build_js', ['bower_concat', 'uglify']);
    grunt.registerTask('build_css', ['cssmin']);
    grunt.registerTask('build_all', ['build_js', 'build_css']);

    grunt.registerTask('concat_all', ['concat:js', 'concat:css']);

    grunt.registerTask('dev', ['bower_concat', 'concat_all']);

    grunt.registerTask('default', ['concurrent:dev']);
    grunt.registerTask('prod', ['build_all']);
};
