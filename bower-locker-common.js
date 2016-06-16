#!/usr/bin/env node
var fs = require('fs');
var nodePath = require('path');
var cwd = process.cwd();

/**
 * Function to return the metadata for all the dependencies loaded within the `bower_components` directory
 * @returns {Object} Returns dependency object for each dependency containing (dirName, commit, release, src, etc.)
 */
function getAllDependencies() {
    var bowerDependencies = fs.readdirSync("./bower_components", {encoding: "utf8"});
    return bowerDependencies.map(function(dirname) {
        var filepath = nodePath.resolve(cwd, './bower_components', dirname, ".bower.json");
        var dependencyInfo = getDependency(filepath);
        dependencyInfo.dirName = dirname;
        return dependencyInfo;
    });
}

/**
 * Function to read and return the specific metadata of a bower component
 * @param filepath {String} Filepath pointing to the JSON metadata
 * @returns {Object} Returns dependency metadata object (dirName, commit, release, src, etc.)
 */
function getDependency(filepath) {
    var bowerInfoStr = fs.readFileSync(filepath, {encoding: "utf8"});
    var bowerInfo = JSON.parse(bowerInfoStr);
    return mapDependencyData(bowerInfo);
}

/**
 * Function to pull out and map the specific bower component metadata to our preferred form
 * @param bowerInfo
 * @returns {{name: String, commit: String, release: String, src: String, originalSrc: String}}
 */
function mapDependencyData(bowerInfo) {
    return {
        name: bowerInfo.name,
        commit: bowerInfo._resolution.commit,
        release: bowerInfo._release,
        src: bowerInfo._source,
        originalSrc: bowerInfo._originalSource
    };
}

module.exports = {
    getAllDependencies: getAllDependencies,
    getDependency: getDependency,
    mapDependencyData: mapDependencyData
};
