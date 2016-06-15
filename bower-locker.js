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
    .action(function(cmd) {
        if (cmd in bowerLocker) {
            return bowerLocker[cmd]();
        }
    });

program.parse(process.argv);

