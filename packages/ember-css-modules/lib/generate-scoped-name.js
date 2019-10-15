'use strict';

const hashString = require('hash-string');
const debug = require('debug')('ember-css-modules:generate-scoped-name');

module.exports = function generateScopedName(className, modulePath) {
  let hash = hashString(modulePath).toString(36).substring(0, 6);
  let scopedName = `_${className}_${hash}`;

  debug('scoped class .%s => .%s (%s)', className, scopedName, modulePath);

  return scopedName;
};
