#!/usr/bin/env node
'use strict';

var fs = require('fs');
var nodePath = require('path');
var cwd = process.cwd();

/**
 * Function to pull out and map the specific bower component metadata to our preferred form
 * @param {Object} bowerInfo
 * @returns {{name: String, commit: String, release: String, src: String, originalSrc: String}}
 */
function mapDependencyData(bowerInfo) {
    return {
        name: bowerInfo.name,
        commit: bowerInfo._resolution !== undefined ? bowerInfo._resolution.commit : undefined,
        release: bowerInfo._release,
        src: bowerInfo._source,
        originalSrc: bowerInfo._originalSource
    };
}

/**
 * Function to read and return the specific metadata of a bower component
 * @param {String} filepath Filepath pointing to the JSON metadata
 * @returns {Object} Returns dependency metadata object (dirName, commit, release, src, etc.)
 */
function getDependency(filepath) {
    var bowerInfoStr = fs.readFileSync(filepath, {encoding: 'utf8'});
    var bowerInfo = JSON.parse(bowerInfoStr);
    return mapDependencyData(bowerInfo);
}

/**
 * Gets the Bower RC data
 * @returns {Object|null} Returns the JSON objects from the file if it's found, null otherwise
 */
function getBowerRC() {
    if (fs.existsSync('.bowerrc')) {
        return JSON.parse(fs.readFileSync('.bowerrc', {encoding: 'utf8'}));
    }

    return null;
}

/**
 * Gets the folder in which Bower components are stored
 * @returns {String}
 */
function getBowerFolder() {
    var bowerRC = getBowerRC();
    if (bowerRC === null || bowerRC.directory === undefined) {
        return 'bower_components';
    }

    return bowerRC.directory;
}

/**
 * Function to return the metadata for all the dependencies loaded within the `bower_components` directory
 * @returns {Object} Returns dependency object for each dependency containing (dirName, commit, release, src, etc.)
 */
function getAllDependencies() {
    var folder = './' + getBowerFolder();
    var bowerDependencies = fs.readdirSync(folder, {encoding: 'utf8'});

    var dependencyInfos = [];
    bowerDependencies.forEach(function(dirname) {
        var filepath = nodePath.resolve(cwd, folder, dirname, '.bower.json');
        if (fs.existsSync(filepath)) {
            var dependencyInfo = getDependency(filepath);
            dependencyInfo.dirName = dirname;
            dependencyInfos.push(dependencyInfo);
        }
    });

    return dependencyInfos;
}

module.exports = {
    getAllDependencies: getAllDependencies,
    getDependency: getDependency,
    mapDependencyData: mapDependencyData
};
