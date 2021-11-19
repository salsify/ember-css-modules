'use strict';

const path = require('path');
const ensurePosixPath = require('ensure-posix-path');

module.exports = function resolvePath(importPath, fromFile, options) {
  let pathWithExtension = path.extname(importPath) ? importPath : (importPath + '.' + options.defaultExtension);

  if (isRelativePath(pathWithExtension)) {
    return resolveRelativePath(pathWithExtension, fromFile, options);
  } else if (isLocalPath(pathWithExtension, options)) {
    return resolveLocalPath(pathWithExtension, fromFile, options);
  } else if (isLocalPathWithOldPackageNameRef(pathWithExtension, options)) {
    const amendedPathWithExtension = pathWithExtension.replace(options.parentName, options.ownerName);
    options.ui.writeWarnLine(
      'For addons that define a moduleName, you should reference any CSS Modules provided by that addon ' +
      'using its moduleName instead of the package name.\n' +
      'Current path: ' + importPath + '\n' +
      'Replace with: ' + importPath.replace(options.parentName, options.ownerName) + '\n' +
      'File: ' + fromFile
    );
    return resolveLocalPath(amendedPathWithExtension, fromFile, options);
  } else {
    return resolveExternalPath(pathWithExtension, importPath, fromFile, options);
  }
};

function isRelativePath(importPath) {
  return /^\.\.?\//.test(importPath);
}

function isLocalPath(importPath, options) {
  return importPath.indexOf(options.ownerName + '/') === 0;
}

function isLocalPathWithOldPackageNameRef(importPath, options) {
  return (options.ownerName !== options.parentName) && importPath.indexOf(options.parentName + '/') === 0;
}

function resolveRelativePath(importPath, fromFile, options) {
  let absolutePath = ensurePosixPath(path.resolve(path.dirname(fromFile), importPath));
  return internalDep(absolutePath, options);
}

// Resolve absolute paths pointing to the same app/addon as the importer
function resolveLocalPath(importPath, fromFile, options) {
  const fromFileStartsWithOwnerName = fromFile.substring(options.root.length + 1).startsWith(options.ownerName);

  // Depending on the exact version of Ember CLI and/or Embroider in play, the
  // app/addon name may or may not be included in `fromFile`'s path. If not, we
  // need to strip that prefix from the import path.
  if (!fromFileStartsWithOwnerName) {
    importPath = importPath.substring(options.ownerName.length + 1);
  }

  let absolutePath = ensurePosixPath(path.resolve(options.root, importPath));
  return internalDep(absolutePath, options);
}

// Resolve absolute paths pointing to external addons
function resolveExternalPath(importPath, originalPath, fromFile, options) {
  let baseIndex = importPath[0] === '@' ? importPath.indexOf('/') + 1 : 0;
  let addonName = importPath.substring(0, importPath.indexOf('/', baseIndex));
  let addon = options.parent.addons.find((addon) => {
    if (addon.moduleName) {
      return addon.moduleName() === addonName;
    }
    return addon.name === addonName;
  });

  if (!addon) {
    throw new Error(
      `Unable to resolve styles module '${originalPath}' imported from '${fromFile}'. ` +
      `No virtual module with that name was defined and no corresponding addon was found.`
    );
  }

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
