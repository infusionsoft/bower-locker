# bower-locker

`bower-locker` is a node module for providing "pseudo"-locking capability for a project leveraging
[bower](https://bower.io/).

Bower doesn't inherently provide a locking mechanism (see https://github.com/bower/bower/issues/505)

## How does it work?

`bower-locker` reads through all of the subfolders of the `bower_components` directory to examine each components `.bower.json` where it extracts information pertinent to the release that is currently being used.

It then generates a new `bower.json` (saving a copy of the original as `bower-locker.bower.json`) where it defines each direct and indirect dependency (i.e., all components currently in the `bower_components` directory) with an exact commit id, under the `dependencies` block and adds an entry for each in the `resolutions` block in the event that any of them tries to load a conflicting dependency version.

Both the new `bower.json` and the original (saved as `bower-locker.bower.json`) can then be uploaded to the Git repo.

Anybody pulling down the project, will be able to run `bower install` normally and they "should" get the exact versions of the components previously used.

To validate that intended versions were, in fact, installed, run `bower-locker validate`.  It will again compare the downloaded components with the `bower.json` file.

To update the versions used, simply run `bower-locker unlock` to return to the original `bower.json`.  Update the bower config as desired including running `bower install`.  When done, just run `bower-locker lock` again to lock in that new version.

## Install

Install the `bower-locker` module globally:

```bash
npm install -g git+ssh://git@github.com/infusionsoft/bower-locker.git
```

This will install a global command of `bower-locker`.

## Use

### lock
```bash
bower-locker lock 
```
Expects to run from within a folder that contains a `bower.json` and a `./bower_components/` folder.

If there is no `bower_components` folder yet, just run `bower install` first to generate it.

It should save a copy of `bower.json` as `bower-locker.bower.json` and then change `bower.json` to be a "locked" version with an additional "bowerLocker" section.  

The "bowerLocker" property object that contains the "lastUpdated" timestamp for when the locked version was generated.  It also contains a "versions" property object within "bowerLocker" which records the versions that were locked in as a version number to more easily know what version we are using for each dependency.

Using the `-v` flag will output the bower dependency versions that are being locked.

### unlock
```bash
bower-locker unlock 
```
Expects to run from within a folder that contains a `bower.json`, `./bower_components/` folder, and a `bower-locker.bower.json`.file.

It will check that `bower.json` is a locked bower file.  If so, it will simply replace `bower.json` with `bower-locker.bower.json`.

Use this command to unlock the bower file for manual updates and edits.  When done updating and editing the `bower.json` or the `bower_components` folder, run `bower-locker lock` to relock it.

### validate
```bash
bower-locker validate 
```
Expects to run from within a folder that contains a `bower.json`, `./bower_components/` folder, and a `bower-locker.bower.json`.file.

It will check that `bower.json` is a locked bower file.  If so, it will check through all `bower_components` metadata and compare the components found there with the locked versions within `bower.json`.

It will report and new or missing components, and any version differences.

Run validate to make sure that all `bower_components` were installed as expected.

### status
```bash
bower-locker status 
```
Expects to run from within a folder that contains a `bower.json`.

It will report whether or not the `bower.json` is a locked bower file, and the time it was locked.

Using the `-v` flag will also output the locked bower dependency versions.
