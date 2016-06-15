#!/usr/bin/env node
var fs = require('fs');
var nodePath = require('path');
var jsonFormat = require('json-format');
var cwd = process.cwd();
var bowerInfo = require('./bower-locker-common.js');
/* using indent with spaces */
var formatConfig = {
    type: 'space',
    size: 2
};

/*
On `bower-locker lock`:
* Save copy `bower.json` as `bower-locker.unlocked.json`
 * Make sure bower.json isn't already a locked file
 * Perhaps add 'bower-lock' property to bower.json that can be checked
* Get the list of ALL flattened dependencies and their current versions / commit id
* Load `bower.json` into memory as a JS object for manipulation
* Override resolutions block with entries for each dependency with an exact version specified
* Optionally, specify all dependencies in main block with exact versions, as well.
* Add "bower-locker" property to help identify a locked `bower.json` versus an unlocked one
* Save as `bower.json`
 */
function lock() {
    console.log('Start locking ...');

    // Load bower.json and make sure it is a locked bower.json file
    var bowerConfigStr = fs.readFileSync("bower.json", {encoding: "utf8"});
    var bowerConfig = JSON.parse(bowerConfigStr);
    if (bowerConfig.bowerLocker) {
        console.warn("The bower.json is already a bower-locker generated file.\n" +
        "Please run 'bower-locker unlock' before re-running 'bower-locker lock'");
        process.exit(1);
    }

    // Load all dependencies from the bower_components folder
    var dependencies = bowerInfo.getAllDependencies();

    // Create new bower config from existing
    bowerConfig.bowerLocker = {lastUpdated: (new Date()).toISOString(), lockedVersions: {}};
    bowerConfig.resolutions = {};
    bowerConfig.dependencies = {};
    dependencies.forEach(function(dep) {
        // NOTE: Use dirName as the dependency name as it is more accurate than .bower.json properties
        var name = dep.dirName;
        bowerConfig.dependencies[name] = dep.src + "#" + dep.commit; // _source
        bowerConfig.resolutions[name] = dep.commit;
        bowerConfig.bowerLocker.lockedVersions[name] = dep.release;
        console.log("  %s (%s): %s", name, dep.release, dep.commit);
    });
    // Create copy of original bower.json
    fs.writeFileSync("bower-locker.bower.json", jsonFormat(JSON.parse(bowerConfigStr), formatConfig), {encoding: "utf8"});
    // Replace bower.json with "locked" version
    fs.writeFileSync("bower.json", jsonFormat(bowerConfig, formatConfig), {encoding: "utf8"});
}

module.exports = lock;