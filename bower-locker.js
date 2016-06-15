#!/usr/bin/env node
var program = require('commander');
var lockerLock = require('./bower-locker-lock.js');
var lockerValidate = require('./bower-locker-validate.js');
var lockerUnlock = require('./bower-locker-unlock.js');

var bowerLocker = {
    lock: function() {
        lockerLock();
    },
    unlock: function() {
        lockerUnlock();
    },
    validate: function() {
        lockerValidate();
    }
};

program
    .arguments('<cmd>')
    .command('lock', 'lock the current bower usage in a new bower.json')
    .command('unlock', 'unlock the current bower usage back to the original bower.json')
    .command('validate', 'validate that the currently locked bower.json matches the bower_components')
    .action(function(cmd) {
        if (cmd in bowerLocker) {
            return bowerLocker[cmd]();
        }
    });

program.parse(process.argv);

