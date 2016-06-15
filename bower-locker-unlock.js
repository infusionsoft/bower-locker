#!/usr/bin/env node
var fs = require('fs');

/*
On `bower-locker unlock`:
* Replace `bower.json` with `bower-locker.bower.json` contents
 */
function unlock() {
    console.log('Start unlocking ...');

    // Load bower.json and make sure it is a locked bower.json file
    var bowerConfigStr = fs.readFileSync("bower.json", {encoding: "utf8"});
    var bowerConfig = JSON.parse(bowerConfigStr);
    if (!bowerConfig.bowerLocker) {
        console.warn("The bower.json is already unlocked.\n" +
        "Run 'bower-locker lock' to create a locked file.");
        process.exit(1);
    }

    // Load original bower file
    var originalBowerConfigStr = fs.readFileSync("bower-locker.bower.json", {encoding: "utf8"});
    // Write it back as bower.json
    fs.writeFileSync("bower.json", originalBowerConfigStr, {encoding: "utf8"});

    console.log("Unlocking completed.");
}

module.exports = unlock;