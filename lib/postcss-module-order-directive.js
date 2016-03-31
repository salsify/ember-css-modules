/* jshint node: true */
'use strict';

var postcss = require('postcss');

// Report all discovered @after-module rules in a module and strip them out of the source
module.exports = postcss.plugin('ember-css-modules-ordering', function(options) {
  return function(css) {
    var dependencies = [];
    css.walkAtRules(function(rule) {
      if (rule.name !== 'after-module') { return; }

      dependencies.push(rule.params.replace(/^['"]|["']$/g, ''));
      rule.remove();
    });

    if (dependencies.length) {
      options.updateDependencies(css.source.input.file, dependencies);
    }
  };
});
