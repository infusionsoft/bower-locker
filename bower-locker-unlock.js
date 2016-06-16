#!/usr/bin/env node
'use strict';

var fs = require('fs');

/**
 * Function to unlock the `bower.json` file by returning it to its unlocked version
 *   The unlocked version is stored at `bower-locker.bower.json`
 * @param {Boolean} isVerbose Flag to indicate whether we should log verbosely or not
 */
function unlock(isVerbose) {
    if (isVerbose) {
        console.log('Start unlocking ...');
    }

    // Load bower.json and make sure it is a locked bower.json file
    var bowerConfigStr = fs.readFileSync('bower.json', {encoding: 'utf8'});
    var bowerConfig = JSON.parse(bowerConfigStr);
    if (!bowerConfig.bowerLocker) {
        console.warn('The bower.json is already unlocked.\n' +
        "Run 'bower-locker lock' to create a locked file.");
        process.exit(1);
    }

    // Load original bower file
    var originalBowerConfigStr = fs.readFileSync('bower-locker.bower.json', {encoding: 'utf8'});
    // Write it back as bower.json
    fs.writeFileSync('bower.json', originalBowerConfigStr, {encoding: 'utf8'});

    console.log('Unlocking completed.');
}

module.exports = unlock;
