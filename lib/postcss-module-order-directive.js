'use strict';

const postcss = require('postcss');
const ensurePosixPath = require('ensure-posix-path');

// Report all discovered @after-module rules in a module and strip them out of the source
module.exports = postcss.plugin('ember-css-modules-ordering', (options) => {
  return (css) => {
    let dependencies = [];
    css.walkAtRules((rule) => {
      if (rule.name !== 'after-module') { return; }

      dependencies.push(rule.params.replace(/^['"]|["']$/g, ''));
      rule.remove();
    });

    if (dependencies.length) {
      options.updateDependencies(ensurePosixPath(css.source.input.file), dependencies);
    }
  };
});
