'use strict';

module.exports = function normalizePostcssPlugins(plugins) {
  let result = { before: [], after: [], postprocess: [] };

  if (Array.isArray(plugins)) {
    result.after = plugins;
  } else {
    Object.assign(result, plugins);
  }

  return result;
};
