#!/usr/bin/env node
'use strict';

var fs = require('fs');
var bowerInfo = require('./bower-locker-common.js');

/**
 * Function to validate that the currently locked `bower.json` matches the dependencies within the `bower_components`
 *   directory.
 *   It checks:
 *     * All the components within the `bower_components` directory are listed within the `bower.json`
 *     * All the components within the `bower.json` exist within the `bower_components` directory
 *     * All components within the `bower_components` directory are of the version specified within `bower.json`
 * @param {Boolean} isVerbose Flag to indicate whether we should log verbosely or not
 */
function validate(isVerbose) {
    if (isVerbose) {
        console.log('Start validating ...');
    }

    // Load bower.json and make sure it is a locked bower.json file
    var bowerConfigStr = fs.readFileSync('bower.json', {encoding: 'utf8'});
    var bowerConfig = JSON.parse(bowerConfigStr);
    if (!bowerConfig.bowerLocker) {
        console.warn('The bower.json is not a bower-locker generated file.\n' +
        "Please run 'bower-locker lock' before validating");
        process.exit(1);
    }

    var errorsFound = 0;

    // Load all dependencies from the bower_components folder
    var allDependencies = bowerInfo.getAllDependencies();

    // Map bower.json resolutions block to form for easier checking
    var allBowerResolutions = Object.keys(bowerConfig.resolutions).map(function(key) {
        return {name: key, commit: bowerConfig.resolutions[key]};
    });

    var deps = {};
    // Make sure all bower_components have match in resolutions block
    allDependencies.forEach(function(dep) {
        var name = dep.dirName;
        if (!(name in bowerConfig.resolutions)) {
            errorsFound++;
            console.warn('Missing dependency that exists under bower_components but not in bower.json: %s', name);
        } else {
            deps[name] = dep;
            if (bowerConfig.resolutions[name] !== dep.commit) {
                errorsFound++;
                console.error('Commit mismatch found: %s', name);
                console.error('\tbower_components commit: %s', dep.commit);
                console.error('\tbower.json commit: %s', bowerConfig.resolutions[name]);
            }
        }
    });
    // Make sure all resolution block items exist under bower_components
    allBowerResolutions.forEach(function(resolution) {
        if (!(resolution.name in deps)) {
            errorsFound++;
            console.warn('Resolution defined in bower.json has no match under bower_components: %s', resolution.name);
        }
    });
    console.log('Validation complete: %s error(s) found.', errorsFound);
    if (errorsFound) {
        process.exit(1);
    }
}

module.exports = validate;
