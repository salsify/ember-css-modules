/* jshint node: true */
'use strict';

var path = require('path');

// This doesn't allow imports from other addons, but it at least gives the ability to specify paths relative to the root
module.exports = function resolvePath(importPath, fromFile) {
  var pathWithExtension = path.extname(importPath) ? importPath : (importPath + '.css');

  if (isRelativePath(pathWithExtension)) {
    return path.resolve(path.dirname(fromFile), pathWithExtension);
  } else {
    return resolveAbsolutePath(pathWithExtension, fromFile);
  }
};

function isRelativePath(importPath) {
  return /^\.\.?\//.test(importPath);
}

function resolveAbsolutePath(relativePath, fromFile) {
  var moduleName = relativePath.substring(0, relativePath.indexOf(path.sep) - 1);
  var prefix = fromFile.substring(0, fromFile.lastIndexOf(moduleName));
  return path.resolve(prefix, path.join('.', relativePath));
}
