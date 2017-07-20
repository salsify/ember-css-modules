import { module, test } from 'qunit';

import aStyles from 'dummy/styles/testing/ordering/a';
import bStyles from 'dummy/styles/testing/ordering/b';
import cStyles from 'dummy/styles/testing/ordering/c';
import gStyles from 'dummy/styles/testing/ordering/g';
import hStyles from 'dummy/styles/testing/ordering/h';
import pStyles from 'dummy/styles/testing/ordering/p';
import qStyles from 'dummy/styles/testing/ordering/q';
import rStyles from 'dummy/styles/testing/ordering/r';
import tStyles from 'dummy/styles/testing/ordering/t';
import uStyles from 'dummy/styles/testing/ordering/u';
import xStyles from 'dummy/styles/testing/ordering/x';
import yStyles from 'dummy/styles/testing/ordering/y';
import zStyles from 'dummy/styles/testing/ordering/z';

module('Unit | Module Ordering');

test('modules are ordered according to composition and explicit directives', function(assert) {
  let orderedClassNames = [
    // headerFiles
    hStyles.h,
    gStyles.g,

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
    yStyles.y,

    // fooderFiles
    tStyles.t,
    uStyles.u
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
