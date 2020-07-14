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
        originalSrc: bowerInfo._originalSource,
        dependencies: Object.keys(bowerInfo.dependencies || {}),
        devDependencies: Object.keys(bowerInfo.devDependencies || {})
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
 * @returns {Array} Returns dependency object for each dependency containing (dirName, commit, release, src, etc.)
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

/**
 * Recursively collects dependency info for root dependencies and their dependencies. Collected dependencies are
 * removed from dependenciesMap to avoid duplication
 * @param {Object} dependenciesMap Map of all uncollected dependencies
 * @param {Array} roots Dependency names
 * @returns {Array} dependency infos
 */
function collectDependencies(dependenciesMap, roots) {
    return roots.reduce(function(dependencies, dependencyName) {
        if (dependenciesMap[dependencyName]) {
            var dependencyInfo = dependenciesMap[dependencyName];
            dependenciesMap[dependencyName] = null;
            dependencies.push(dependencyInfo);
            dependencies = dependencies.concat(collectDependencies(dependenciesMap, dependencyInfo.dependencies));
        }

        return dependencies;
    }, []);
}

/**
 * Function to return the metadata for dependencies loaded within the `bower_components` directory, bucketted by
 * the type of saved reference to the dependencies in bower.json, i.e., dependencies, devDependencies, or unsaved
 * @returns {Object} Returns object with `dependencies`, `devDependencies`, and `unsaved` arrays containing dependency
 *     objects for each project. Projects that are directly or indirectly required by both dependencies and
 *     devDependencies are returned only in `dependencies` to avoid duplication
 */
function getDependenciesByRef() {
    var dependenciesMap = getAllDependencies().reduce(function(dependenciesMap, dep) {
        dependenciesMap[dep.dirName] = dep;
        return dependenciesMap;
    }, {});

    var projectInfo = getDependency('./bower.json');
    var dependencies = collectDependencies(dependenciesMap, projectInfo.dependencies);
    var devDependencies = collectDependencies(dependenciesMap, projectInfo.devDependencies);
    var unsaved = Object.keys(dependenciesMap).reduce(function(unsaved, key) {
        if (dependenciesMap[key]) {
            unsaved.push(dependenciesMap[key]);
        }

        return unsaved;
    }, []);

    return {
        dependencies: dependencies,
        devDependencies: devDependencies,
        unsaved: unsaved
    };
}

module.exports = {
    getAllDependencies: getAllDependencies,
    getDependenciesByRef: getDependenciesByRef,
    getDependency: getDependency,
    mapDependencyData: mapDependencyData
};
