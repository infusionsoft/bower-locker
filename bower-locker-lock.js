#!/usr/bin/env node
//var program = require('commander');
//var find = require('find');
var fs = require('fs');
var nodePath = require('path');
var jsonFormat = require('json-format');
var cwd = process.cwd();
/* using indent with spaces */
var formatConfig = {
    type: 'space',
    size: 2
};

console.log('Start locking ...');

/* find.file(filepathRE, ".", function(files) {
    files.forEach(function(file) {
        var fullFilePath = nodePath.resolve(cwd, file);
        var foundExcluded = excludedDirectories.reduce(function(prev, item) {
            return prev || fullFilePath.indexOf(item) === 0;
        }, false);
        if (!foundExcluded) {
            fs.readFile(file, function(err, data) {
                if (err) throw err;
                standards.checkPolymerComponent(file, data, {verbose: program.verbose});
            });
        } else {
        }
    });
}); */
/*
On `bower-locker lock`:
* Save copy `bower.json` as `bower-locker.unlocked.json`
 * Make sure bower.json isn't already a locked file
 * Perhaps add 'bower-lock' property to bower.json that can be checked
* Get the list of ALL flattened dependencies and their current versions / commit id
* Load `bower.json` into memory as a JS object for manipulation
* Override resolutions block with entries for each dependency with an exact version specified
* Optionally, specify all dependencies in main block with exact versions, as well.
* Save as `bower-locker.locked.json` and `bower.json`

On `bower-locker unlock`:
* Replace `bower.json` with `bower-locker.unlocked.json` contents
 */
fs.readFile("bower-locker.sample.json", {encoding: "utf8"}, function(err, data) {
        if (err) throw err;
        var bowerConfig = {};
        if (data) {
            var bowerConfigStr = data;
            bowerConfig = JSON.parse(data);
            fs.readdir("./bower_components", function(err, data) {
                if (err) throw err;
                var dependencies = data.map(function(dirname) {
                    var filepath = nodePath.resolve(cwd, './bower_components', dirname, ".bower.json");
                    var bowerInfoStr = fs.readFileSync(filepath, {encoding: "utf8"});
                    var bowerInfo = JSON.parse(bowerInfoStr);
                    return {
                        name: bowerInfo.name,
                        commit: bowerInfo._resolution.commit,
                        src: bowerInfo._originalSource
                    };
                });
                bowerConfig.resolutions = {};
                bowerConfig.dependencies = {};
                dependencies.forEach(function(dep) {
                    // Use _originalSource if no "/" to be more consistent than name
                    // e.g., name = "Chart.js", _originalSource = "chartjs"
                    var name = (dep.src.indexOf("/") > -1) ? dep.name : dep.src;
                    bowerConfig.dependencies[name] = dep.src + "#" + dep.commit; // _originalSource
                    bowerConfig.resolutions[name] = dep.commit;
                });
                console.log("Locking the following dependencies:\n", bowerConfig.dependencies);
                // Create copy of original bower.json
                fs.writeFileSync("bower-locker.original.json", jsonFormat(JSON.parse(bowerConfigStr), formatConfig), {encoding: "utf8"});
                // Create copy of locked bower.json
                fs.writeFileSync("bower-locker.locked.json", jsonFormat(bowerConfig, formatConfig), {encoding: "utf8"});
                // Replace bower.json with "locked" version
                fs.writeFileSync("bower.json", jsonFormat(bowerConfig, formatConfig), {encoding: "utf8"});
            });
        }
    });
