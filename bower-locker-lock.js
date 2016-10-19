#!/usr/bin/env node
'use strict';

var fs = require('fs');
var bowerInfo = require('./bower-locker-common.js');
var jsonFormat = require('json-format');
var semver = require('semver');
/* using indent with spaces */
var formatConfig = {
    type: 'space',
    size: 2
};

/**
 * Function to lock `bower.json` with the components that currently exist within the `bower_components` directory
 * This is accomplished by:
 *   * Saving a copy of `bower.json` as `bower-locker.unlocked.json`
 *   * Getting a list of ALL flattened dependencies, current versions and commit ids within the `bower_components`
 *   * Load the `bower.json` into memory as a JS object for manipulation
 *   * Override the `dependencies` and `resolutions` blocks with values specific to the current versions
 *   * Save the updated (i.e., locked) `bower.json`
 * @param {Boolean} isVerbose Flag to indicate whether we should log verbosely or not
 */
function lock(isVerbose) {
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


    // Load all dependencies from the bower_components folder
    var dependencies = bowerInfo.getAllDependencies();

	bowerConfig.bowerLocker = {
		lastUpdated: (new Date()).toISOString(),
		//For future improvements
		originalVersions: {
			dependencies: {},
			devDependencies: {}
		}
	};
	
	//Iterate over dependecies found and set the version number as it found or as it was if not found. 
    dependencies.forEach(function(dep) {
        // NOTE: Use dirName as the dependency name as it is more accurate than .bower.json properties
		var name = dep.dirName;
		var validVersionNumber = semver.valid(dep.release);
		
		if(isVerbose)
		{
			if(!validVersionNumber)
				console.log('err: %s with release number as (%s) not locked !', name, dep.release, dep.commit);
			else
				console.log('  %s (%s): %s locked', name, dep.release, dep.commit);
		}
				
		setReleaseValue(bowerConfig, dep, validVersionNumber);
    });
    // Create copy of original bower.json
    fs.writeFileSync('bower-locker.bower.json', bowerConfigStr, {encoding: 'utf8'});
    // Replace bower.json with 'locked' version
    fs.writeFileSync('bower.json', jsonFormat(bowerConfig, formatConfig), {encoding: 'utf8'});

    console.log('Locking completed.');
}

function setReleaseValue(bowerConfig,dep, validVersionNumber) {
	var name = dep.dirName;
	if(bowerConfig.dependencies && bowerConfig.dependencies[name])
	{
		bowerConfig.bowerLocker.originalVersions.dependencies[name] = bowerConfig.dependencies[name];
		
		bowerConfig.dependencies[name] = validVersionNumber
											? dep.release
											: bowerConfig.dependencies[name];		
	}
	
	if(bowerConfig.devDependencies && bowerConfig.devDependencies[name])		
	{
		bowerConfig.bowerLocker.originalVersions.devDependencies[name] = bowerConfig.devDependencies[name];
		
		bowerConfig.devDependencies[name] = validVersionNumber
												? dep.release
												: bowerConfig.devDependencies[name];
	}
}

module.exports = lock;
