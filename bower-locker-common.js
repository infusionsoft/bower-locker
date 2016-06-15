#!/usr/bin/env node
var fs = require('fs');
var nodePath = require('path');
var cwd = process.cwd();

// Read through bower_components directory to return an array of dependencies objects
function getAllDependencies() {
    var bowerDependencies = fs.readdirSync("./bower_components", {encoding: "utf8"});
    return bowerDependencies.map(function(dirname) {
        var filepath = nodePath.resolve(cwd, './bower_components', dirname, ".bower.json");
        var dependencyInfo = getDependency(filepath);
        dependencyInfo.dirName = dirname;
        return dependencyInfo;
    });
}

// Read a specific bower metadata file to return dependency object
function getDependency(filepath) {
    var bowerInfoStr = fs.readFileSync(filepath, {encoding: "utf8"});
    var bowerInfo = JSON.parse(bowerInfoStr);
    return mapDependencyData(bowerInfo);
}

// Map from bower metadata json into a simpler form
function mapDependencyData(bowerInfo) {
    return {
        name: bowerInfo.name,
        commit: bowerInfo._resolution.commit,
        release: bowerInfo._release,
        src: bowerInfo._source, //_originalSource,
        originalSrc: bowerInfo._originalSource
    };
}

module.exports = {
    getAllDependencies: getAllDependencies,
    getDependency: getDependency,
    mapDependencyData: mapDependencyData
};
