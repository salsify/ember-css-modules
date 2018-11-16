'use strict';

const { existsSync } = require('fs');
const { join } = require('path');

const cache = new WeakMap();

function testForModuleUnification(appOrAddon) {
  return existsSync(join(appOrAddon.root, 'src'));
}

/**
 * This function will soon be available as a method on apps and addons.
 *
 * https://github.com/emberjs/ember.js/issues/16373
 */
module.exports = function isModuleUnification(appOrAddon) {
  if (!cache.has(appOrAddon)) {
    cache.set(appOrAddon, testForModuleUnification(appOrAddon));
  }

  return cache.get(appOrAddon);
};
