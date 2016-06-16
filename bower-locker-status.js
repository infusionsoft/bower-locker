#!/usr/bin/env node
'use strict';

var fs = require('fs');

/**
 * Function to format a given time difference of milliseconds into a string describing it in terms of days, hours, or
 *   minutes ago.
 *   It rounds the time difference to the nearest 1/10th of a day or hour, or the nearest second, minute.
 * @param {Number} milliseconds Number of milliseconds of the time difference
 * @returns {string} String of english describing the time difference
 */
function formatTimeDiff(milliseconds) {
    var seconds = Math.floor(milliseconds / 1000);
    var timeDiffStr = seconds + ' seconds ago';
    var time;
    if (seconds > 24 * 60 * 60) {
        time = Math.floor(seconds * 10 / (24 * 60 * 60)) / 10;
        timeDiffStr = time + ' day(s) ago';
    } else if (seconds > 60 * 60) {
        time = Math.floor(seconds * 10 / (60 * 60)) / 10;
        timeDiffStr = time + ' hour(s) ago';
    } else if (seconds > 60) {
        time = Math.floor(seconds / 60);
        timeDiffStr = time + ' minute(s) ago';
    }
    return timeDiffStr;
}

/**
 * Function to output the current status of the `bower.json` file.
 *   Indicates whether it is locked, when it was locked, and if verbose the locked version of the dependencies.
 * @param {Boolean} isVerbose Flag to indicate whether we should log verbosely or not
 */
function status(isVerbose) {
    // Load bower.json and make sure it is a locked bower.json file
    var bowerConfigStr = fs.readFileSync('bower.json', {encoding: 'utf8'});
    var bowerConfig = JSON.parse(bowerConfigStr);
    var locked = bowerConfig.bowerLocker;
    if (locked) {
        var timeDiff = (new Date()).getTime() - (new Date(locked.lastUpdated)).getTime();
        console.log('bower.json was locked as of %s (%s)', locked.lastUpdated, formatTimeDiff(timeDiff));
        if (isVerbose) {
            console.log('Currently locked dependencies:');
            Object.keys(locked.lockedVersions).forEach(function(key) {
                console.log('  %s (%s): %s', key, locked.lockedVersions[key], bowerConfig.resolutions[key]);
            });
        }
    } else {
        console.log('The bower.json is currently unlocked.\n');
    }
}

module.exports = status;
