module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            js: {

                src: ['js/app.js', 'js/knockout-3.3.0.js', 'jquery-2.1.4.js'],
                dest: 'build/combined.min.js'

            }
        },

        cssmin: {
            css: {
                files: {
                    'build/style.min.css': ['css/style.css'],
                }
            }
        },

        autoprefixer: {
            options: {
                browsers: ['last 2 versions', '> 5%']
            },
            no_dest: {
                src: 'build/style.min.css'
            }
        }

        // Configuration for concatenating files 
        /*  concat: {
              dist: {
                  //src: ['js/app.min.js', 'js/knockout-3.3.0.min.js', 'jquery-2.1.4.min.js'],// All JS in the libs folder
                  src: 'build/minified/*.min.js',
                  dest: 'build/combined.min.js',
              }
          }*/

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-autoprefixer');
    /*   grunt.loadNpmTasks('grunt-contrib-concat');*/

    grunt.registerTask('default', ['uglify', 'cssmin', 'autoprefixer']);

};