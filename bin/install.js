let fs = require('fs');
let lib = require('../lib');
let tools = require('../tools');
let atomar_config = require('../config');

exports.command = 'install [module]';
exports.describe = 'Installs an atomar module or installs all the dependencies found an atomar.json file';
exports.builder = {
    global: {
        alias: 'g',
        description: 'Install the module globally',
        default: false
    },
    version: {
        alias: 'v',
        description: 'The version to be installed',
        default: '*'
    },
    ssh: {
        default: atomar_config.use_ssh,
        description: 'clone via ssh'
    }
};
exports.handler = function(argv) {
    if(argv.ssh) {
        console.log('\nUsing SSH...');
    }
    if(argv.module) {
        lib.install_module(argv.module, argv.v, argv.g ? null : 'atomar_modules', argv.ssh);
    } else {
        // install dependencies
        let config = atomar_config.loadPackage();
        if(config !== null) {
            if(config.dependencies && Object.keys(config.dependencies).length > 0) {
                for(let module in config.dependencies) {
                    if(config.dependencies.hasOwnProperty(module)) {
                        lib.install_module(module, config.dependencies[module], 'atomar_modules', argv.ssh);
                    }
                }
            } else {
                console.warn(config.name + ' has no dependencies.');
            }
        } else {
            console.warn('Not an Atomar module');
        }
        // run composer on module in current directory
        if(lib.has_composer('./')) {
            console.log('\nUpdating composer dependencies for ' + config.name);
            lib.run_composer('./');
        }
    }
};