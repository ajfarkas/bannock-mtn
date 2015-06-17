module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    sass: {
      dist: {
        options: {
          trace: true,
          update: true
        },
        files: {
          './weather.css':'./sass/weather.scss'
        }
      }
    },
    react: {
      files: {
        expand: true,
        cwd: './js/react_src',
        src: ['**/*.jsx'],
        dest: './js',
        ext: '.js'
      }
    },
    watchify: {
      example: {
        src: './js/index.js',
        dest: './js/weatherApp.js'
      }
    },
    watch: {
      sass: {
        files: ['./sass/weather.scss'],
        tasks: ['sass']
      },
      react: {
        files: ['./js/react_src/*.jsx'],
        tasks: ['react']
      },
      watchify: {
        files: ['./js/index.js'],
        tasks: ['watchify']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-sass')
  grunt.loadNpmTasks('grunt-react')
  grunt.loadNpmTasks('grunt-watchify')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('default', ['watch'])

}