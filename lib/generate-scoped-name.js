/* jshint node: true */
'use strict';

var hashString = require('hash-string');
var debug = require('debug')('ember-css-modules:generate-scoped-name');

module.exports = function generateScopedName(className, modulePath) {
  var hash = hashString(modulePath).toString(36).substring(0, 6);
  var scopedName = '_' + className + '_' + hash;

  debug('scoped class .%s => .%s (%s)', className, scopedName, modulePath);

  return scopedName;
};
