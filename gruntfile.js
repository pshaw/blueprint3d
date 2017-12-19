module.exports = function (grunt) {

    require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

    var globalConfig = {
        moduleName: "blueprint3d",
        sources: ["src/*.ts", "src/*/*.ts"],
        exampleSources: ["example/js/src/*.ts", "example/js/src/*/*.ts"],
        srcDir: "src",
        outDir: "dist",
        docDir: "doc",
        exampleDir: "example/js/"
    };

    var configuration = {
        clean: [
            globalConfig.outDir,
            globalConfig.docDir,
            globalConfig.exampleDir + "/" + globalConfig.moduleName + ".js",
            globalConfig.exampleDir + "/" + globalConfig.moduleName + ".js.map",
            globalConfig.exampleDir + "/three.min.js",
            globalConfig.exampleDir + "/jquery.js",
        ]
    };

    configuration.copy = {
        source: {
            src: globalConfig.srcDir + "/**" ,
            dest: globalConfig.exampleDir + "/"
        },

        compiled: {
            src: globalConfig.outDir + "/" + globalConfig.moduleName + ".js",
            dest: globalConfig.exampleDir + "/" + globalConfig.moduleName + ".js"
        },

        three: {
            src: "node_modules/three/build/three.js",
            dest: globalConfig.exampleDir + "/three.min.js"
        },

        jquery: {
            src: "node_modules/jquery/dist/jquery.js",
            dest: globalConfig.exampleDir + "/jquery.js"
        }

    };

    configuration.ts = {
        options: {
            target: "es6",
            declaration: false,
            sourceMap: true,
            removeComments: false,
            options: {
                types: [
                    "jquery",
                    "three"
                ]
            }
        },
        debug: {
            src: globalConfig.exampleSources,
            dest: globalConfig.exampleDir + "/" + globalConfig.moduleName + ".js"
        },
        release: {
            src: globalConfig.sources,
            dest: globalConfig.outDir + "/" + globalConfig.moduleName + ".js"

        }
    };

    //Watch, Browser Sync and Concurrent

    configuration.watch = {
        scripts: {
            files: ['src/**/*.ts'],
            tasks: ["copy:source", "ts:debug"],
            options: {
                spawn: false,
            }
        }
    };

    configuration.browserSync = {
        dev: {
            bsFiles: {
                src: globalConfig.exampleDir + "/" + globalConfig.moduleName + ".js"
            },
            options: {
                server: {
                    watchTask: true,
                    baseDir: "./example"
                }
            }
        }
    };

    configuration.concurrent = {
        target1: ["browserSync", "watch"]
    };

    //TypeDoc and Uglify

    configuration.typedoc = {
        options: {
            name: globalConfig.moduleName,
            target: "es5",
            mode: "file",
            readme: "none"
        }
    };

    configuration.typedoc[globalConfig.moduleName] = {
        options: {
            out: globalConfig.docDir + "/" + globalConfig.moduleName,
            name: globalConfig.moduleName
        },
        src: globalConfig.sources
    };

    configuration.uglify = {
        options: {
            mangle: true,
            beautify: false,
            sourceMap: true
        }
    };
    configuration.uglify[globalConfig.moduleName] = {
        files: {}
    };

    configuration.uglify[globalConfig.moduleName].files["dist/" + globalConfig.moduleName + ".min.js"] = globalConfig.outDir + "/" + globalConfig.moduleName + ".js";

    grunt.initConfig(configuration);

    grunt.registerTask("example", [
        "copy:three",
        "copy:jquery"
    ]);

    grunt.registerTask("release", [
        "clean",
        "ts:release",
        "uglify:" + globalConfig.moduleName,
        "typedoc:" + globalConfig.moduleName
    ]);

    grunt.registerTask("debug", [
        "clean",
        "copy:source",
        "ts:debug",
        "example",
        "concurrent:target1"
    ]);

    grunt.registerTask("default", [
        "debug"
    ]);

    grunt.event.on('watch', function (action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });
};
