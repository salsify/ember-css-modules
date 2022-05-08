const Funnel = require('broccoli-funnel');
const path = require('path');

function normalize(tree, { moduleName }) {
  return new Funnel(tree, {
    getDestinationPath(relativePath) {
      if (!relativePath.startsWith(moduleName)) {
        return path.join(moduleName, relativePath);
      }
      return relativePath;
    },
  });
}

module.exports = normalize;
