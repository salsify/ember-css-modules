import { module, test } from 'qunit';

import aStyles from 'dummy/styles/ordering/a';
import bStyles from 'dummy/styles/ordering/b';
import cStyles from 'dummy/styles/ordering/c';
import pStyles from 'dummy/styles/ordering/p';
import qStyles from 'dummy/styles/ordering/q';
import rStyles from 'dummy/styles/ordering/r';
import xStyles from 'dummy/styles/ordering/x';
import yStyles from 'dummy/styles/ordering/y';
import zStyles from 'dummy/styles/ordering/z';

module('Unit | Module Ordering');

test('modules are ordered according to composition and explicit directives', function(assert) {
  let orderedClassNames = [
    // @after-module files
    rStyles.r,
    pStyles.p,
    qStyles.q,

    // composes: files
    cStyles.c,
    aStyles.a,
    bStyles.b,

    // @value files
    zStyles.z,
    xStyles.x,
    yStyles.y
  ];

  let orderedSelectors = orderedClassNames.map(name => `.${name.split(' ')[0]}`);
  let rules = findTestRules(findAppStylesheet(), orderedSelectors);

  assert.deepEqual(rules.map(rule => rule.selectorText), orderedSelectors);
});

function findAppStylesheet() {
  for (let i = 0, len = document.styleSheets.length; i < len; i++) {
    let sheet = document.styleSheets[i];
    if (/dummy\.css$/.test(sheet.href)) { return sheet; }
  }
}

function findTestRules(stylesheet, selectors) {
  return Array.prototype.filter.call(stylesheet.cssRules, rule => selectors.indexOf(rule.selectorText) > -1);
}
