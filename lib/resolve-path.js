/* jshint node: true */
'use strict';

var path = require('path');
var ensurePosixPath = require('ensure-posix-path');

module.exports = function resolvePath(importPath, fromFile, options) {
  var pathWithExtension = path.extname(importPath) ? importPath : (importPath + '.' + options.defaultExtension);

  if (isRelativePath(pathWithExtension)) {
    return resolveRelativePath(pathWithExtension, fromFile, options);
  } else if (isLocalPath(pathWithExtension, options)) {
    return resolveLocalPath(pathWithExtension, fromFile, options);
  } else {
    return resolveExternalPath(pathWithExtension, options);
  }
};

function isRelativePath(importPath) {
  return /^\.\.?\//.test(importPath);
}

function isLocalPath(importPath, options) {
  return importPath.indexOf(options.ownerName + '/') === 0;
}

function resolveRelativePath(importPath, fromFile, options) {
  var absolutePath = ensurePosixPath(path.resolve(path.dirname(fromFile), importPath));
  return internalDep(absolutePath, options);
}

// Resolve absolute paths pointing to the same app/addon as the importer
function resolveLocalPath(importPath, fromFile, options) {
  var appOrAddonDirIndex = fromFile.indexOf(options.ownerName, options.root.length);
  var prefix = fromFile.substring(0, appOrAddonDirIndex);
  var absolutePath = ensurePosixPath(path.resolve(prefix, importPath));
  return internalDep(absolutePath, options);
}

// Resolve absolute paths pointing to external addons
function resolveExternalPath(importPath, options) {
  var addonName = importPath.substring(0, importPath.indexOf('/'));
  var addon = options.project.findAddonByName(addonName);
  var pathWithinAddon = importPath.substring(addonName.length + 1);
  var addonTreePath = path.join(addon.root, addon.treePaths.addon);

  var absolutePath = ensurePosixPath(path.resolve(addonTreePath, pathWithinAddon));
  var keyPath = options.addonModulesRoot + addonName + '/' + pathWithinAddon;
  return new DependencyPath('external', absolutePath, keyPath);
}

function internalDep(absolutePath, options) {
  var keyPath = absolutePath.substring(options.root.length + 1);
  return new DependencyPath('internal', absolutePath, keyPath);
}

function DependencyPath(type, absolutePath, keyPath) {
  this.type = type;
  this.absolutePath = absolutePath;
  this.keyPath = keyPath;
}

DependencyPath.prototype.toString = function() {
  return this.absolutePath;
};
