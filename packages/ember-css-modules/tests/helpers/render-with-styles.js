/* global require, define */

import Ember from 'ember';
import ClassTransformPlugin from 'ecm-template-transform';

const { compile } = Ember.__loader.require('ember-template-compiler');

const TEST_STYLES = '-testing/styles';
const TEST_TEMPLATE = '-testing/template.hbs';

export default function registerStyles(styles) {
  if (require.has(TEST_STYLES)) {
    require.unsee(TEST_STYLES);
  }

  define(TEST_STYLES, [], () => ({ default: styles }));

  return function hbs(template) {
    if (Array.isArray(template)) {
      template = template[0];
    }

    const { plugin } = ClassTransformPlugin.instantiate({
      includeExtensionInModulePath: false,
    });

    const plugins = { ast: [plugin] };
    return compile(template, { plugins, moduleName: TEST_TEMPLATE });
  };
}
