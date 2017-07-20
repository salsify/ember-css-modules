'use strict';

const postcss = require('postcss');
const ensurePosixPath = require('ensure-posix-path');

// Report all discovered @after-module rules in a module and strip them out of the source
module.exports = postcss.plugin('ember-css-modules-ordering', (options) => {
  return (css) => {
    let dependencies = [];
    let input = css.source.input;
    let filePath = input.file.replace(input.rootPath + '/', '');

    css.walkAtRules((rule) => {
      if (rule.name !== 'after-module') { return; }

      if (options.emitDeprecationWarning) {
        let warning = '@after-module is deprecated; use `headerFiles` and `footerFiles` instead';
        options.ui.writeDeprecateLine(`${filePath}:${rule.source.start.line} - ${warning}`);
      }

      dependencies.push(rule.params.replace(/^['"]|["']$/g, ''));
      rule.remove();
    });

    if (dependencies.length) {
      options.updateDependencies(ensurePosixPath(css.source.input.file), dependencies);
    }
  };
});
