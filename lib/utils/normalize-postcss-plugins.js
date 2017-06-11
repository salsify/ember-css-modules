'use strict';

module.exports = function normalizePostcssPlugins(plugins) {
  if (!plugins) {
    return { before: [], after: [] };
  } else if (Array.isArray(plugins)) {
    return { before: [], after: plugins };
  } else {
    return plugins;
  }
}
