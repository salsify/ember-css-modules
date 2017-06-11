'use strict';

const path = require('path');
const ensurePosixPath = require('ensure-posix-path');

module.exports = function resolvePath(importPath, fromFile, options) {
  let pathWithExtension = path.extname(importPath) ? importPath : (importPath + '.' + options.defaultExtension);

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
  let absolutePath = ensurePosixPath(path.resolve(path.dirname(fromFile), importPath));
  return internalDep(absolutePath, options);
}

// Resolve absolute paths pointing to the same app/addon as the importer
function resolveLocalPath(importPath, fromFile, options) {
  let appOrAddonDirIndex = fromFile.indexOf(options.ownerName, options.root.length);
  let prefix = fromFile.substring(0, appOrAddonDirIndex);
  let absolutePath = ensurePosixPath(path.resolve(prefix, importPath));
  return internalDep(absolutePath, options);
}

// Resolve absolute paths pointing to external addons
function resolveExternalPath(importPath, options) {
  let addonName = importPath.substring(0, importPath.indexOf('/'));
  let addon = options.project.findAddonByName(addonName);
  let pathWithinAddon = importPath.substring(addonName.length + 1);
  let addonTreePath = path.join(addon.root, addon.treePaths.addon);

  let absolutePath = ensurePosixPath(path.resolve(addonTreePath, pathWithinAddon));
  let keyPath = options.addonModulesRoot + addonName + '/' + pathWithinAddon;
  return new DependencyPath('external', absolutePath, keyPath);
}

function internalDep(absolutePath, options) {
  let keyPath = absolutePath.substring(options.root.length + 1);
  return new DependencyPath('internal', absolutePath, keyPath);
}

class DependencyPath {
  constructor(type, absolutePath, keyPath) {
    this.type = type;
    this.absolutePath = absolutePath;
    this.keyPath = keyPath;
  }

  toString() {
    return this.absolutePath;
  }
}
