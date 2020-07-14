#!/usr/bin/env node

'use strict';

var program = require('commander');
var lockerLock = require('./bower-locker-lock.js');
var lockerValidate = require('./bower-locker-validate.js');
var lockerUnlock = require('./bower-locker-unlock.js');
var lockerStatus = require('./bower-locker-status.js');

var bowerLocker = {
    lock: lockerLock,
    unlock: lockerUnlock,
    validate: lockerValidate,
    status: lockerStatus
};

program
    .command('lock', 'lock the current bower usage in a new bower.json')
    .command('unlock', 'unlock the current bower usage back to the original bower.json')
    .command('validate', 'validate that the currently locked bower.json matches the bower_components')
    .command('status', 'show the current status of the bower.json whether locked or not')
    .option('-v, --verbose', 'turn on verbose output')
    .option('-s, --saved', 'lock only saved dependencies and devDependencies, warn on unsaved projects')
    .action(function(cmd) {
        if (cmd in bowerLocker) {
            return bowerLocker[cmd](program.verbose, program.saved);
        } else {
            console.error("Unknown bower-lock command.  Run 'bower-lock -h' to see options.");
            process.exit(1);
        }
    });

program.parse(process.argv);
