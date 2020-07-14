#!/usr/bin/env node
'use strict';

var fs = require('fs');
var bowerInfo = require('./bower-locker-common.js');
var jsonFormat = require('json-format');
/* using indent with spaces */
var formatConfig = {
    type: 'space',
    size: 2
};

/**
 * Comparison function for sorting dependencies by their directory name
 * @param {Object} dep1 First dependency info object to compare
 * @param {Object} dep2  Second dependency info object to compare
 * @returns {Number} -1 if dep1 should precede dep2, 0 if they have equivalent directory names, 1 if dep1 should
 *     follow dep2
 */
function compareByDirName(dep1, dep2) {
    return dep1.dirName < dep2.dirName ? -1 : dep1.dirName > dep2.dirName ? 1 : 0;
}

/**
 * Function to lock `bower.json` with the components that currently exist within the `bower_components` directory
 * This is accomplished by:
 *   * Saving a copy of `bower.json` as `bower-locker.unlocked.json`
 *   * Getting a list of ALL flattened dependencies, current versions and commit ids within the `bower_components`
 *   * Load the `bower.json` into memory as a JS object for manipulation
 *   * Override the `dependencies`, `resolutions`, and optionally `devDependencies` blocks with values specific to the
 *     current versions
 *   * Save the updated (i.e., locked) `bower.json`
 * @param {Boolean} isVerbose Flag to indicate whether we should log verbosely or not
 * @param {Boolean} saved Flag to indicate whether to only lock saved dependencies and separate devDependencies
 */
function lock(isVerbose, saved) {
    if (isVerbose) {
        console.log('Start locking ...');
    }

    // Load bower.json and make sure it is a locked bower.json file
    var bowerConfigStr = fs.readFileSync('bower.json', {encoding: 'utf8'});
    var bowerConfig = JSON.parse(bowerConfigStr);
    if (bowerConfig.bowerLocker) {
        console.warn('The bower.json is already a bower-locker generated file.\n' +
        "Please run 'bower-locker unlock' before re-running 'bower-locker lock'");
        process.exit(1);
    }

    // Create new bower config from existing
    bowerConfig.bowerLocker = {lastUpdated: (new Date()).toISOString(), lockedVersions: {}};
    bowerConfig.resolutions = {};
    bowerConfig.dependencies = {};

    function addDependency(dependencyMapName, dep) {
        // NOTE: Use dirName as the dependency name as it is more accurate than .bower.json properties
        var name = dep.dirName;
        var version = dep.commit !== undefined ? dep.commit : dep.release;
        bowerConfig[dependencyMapName][name] = dep.src + '#' + version; // _source
        bowerConfig.resolutions[name] = version;
        bowerConfig.bowerLocker.lockedVersions[name] = dep.release;
        if (isVerbose) {
            console.log('  %s (%s): %s', name, dep.release, dep.commit);
        }
    }

    if (saved) {
        bowerConfig.devDependencies = {};
        var allDependencies = bowerInfo.getDependenciesByRef();

        // Sort for consistent ordering/cleaner diffs
        allDependencies.dependencies.sort(compareByDirName);
        allDependencies.devDependencies.sort(compareByDirName);

        if (isVerbose) {
            console.log('Dependencies:');
        }

        allDependencies.dependencies.forEach(addDependency.bind(null, 'dependencies'));

        if (isVerbose) {
            console.log('\nDev Dependencies:');
        }

        allDependencies.devDependencies.forEach(addDependency.bind(null, 'devDependencies'));

        if (allDependencies.unsaved.length) {
            if (isVerbose) {
                var unsavedNames = allDependencies.unsaved.map((dep) => '  ' + dep.dirName + '\n').join('');
                console.warn('\nThe following unsaved dependencies have not been locked:\n' + unsavedNames);
            } else {
                console.warn('Found unsaved dependencies in bower_components. These are not locked.\n' +
                        'Run with --verbose or use \'bower-locker validate\' for more details.');
            }
        }
    } else {
        // Remove devDependency section to prevent version collision
        delete bowerConfig.devDependencies;
        var allDependencies = bowerInfo.getAllDependencies();
        allDependencies.forEach(addDependency.bind(null, 'dependencies'));
    }

    // Create copy of original bower.json
    fs.writeFileSync('bower-locker.bower.json', bowerConfigStr, {encoding: 'utf8'});
    // Replace bower.json with 'locked' version
    fs.writeFileSync('bower.json', jsonFormat(bowerConfig, formatConfig), {encoding: 'utf8'});

    console.log('Locking completed.');
}

module.exports = lock;
