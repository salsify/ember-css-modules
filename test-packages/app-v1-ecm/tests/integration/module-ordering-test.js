import { module, test } from 'qunit';

import aStyles from 'app-v1-ecm/styles/ordering/a';
import bStyles from 'app-v1-ecm/styles/ordering/b';
import cStyles from 'app-v1-ecm/styles/ordering/c';
import gStyles from 'app-v1-ecm/styles/ordering/g';
import hStyles from 'app-v1-ecm/styles/ordering/h';
import tStyles from 'app-v1-ecm/styles/ordering/t';
import uStyles from 'app-v1-ecm/styles/ordering/u';
import xStyles from 'app-v1-ecm/styles/ordering/x';
import yStyles from 'app-v1-ecm/styles/ordering/y';
import zStyles from 'app-v1-ecm/styles/ordering/z';

module('Integration | module ordering', function () {
  test('modules are ordered according to composition and explicit directives', function (assert) {
    let orderedClassNames = [
      // headerFiles
      hStyles.h,
      gStyles.g,

      // composes: files
      cStyles.c,
      aStyles.a,
      bStyles.b,

      // @value files
      zStyles.z,
      xStyles.x,
      yStyles.y,

      // footerFiles
      tStyles.t,
      uStyles.u,
    ];

    let orderedSelectors = orderedClassNames.map(
      (name) => `.${name.split(' ')[0]}`,
    );
    let rules = findTestRules(findAppStylesheet(), orderedSelectors);

    assert.deepEqual(
      rules.map((rule) => rule.selectorText),
      orderedSelectors,
    );
  });

  function findAppStylesheet() {
    for (let i = 0, len = document.styleSheets.length; i < len; i++) {
      let sheet = document.styleSheets[i];
      if (/app-v1-ecm\.css$/.test(sheet.href)) {
        return sheet;
      }
    }
  }

  function findTestRules(stylesheet, selectors) {
    return Array.prototype.filter.call(
      stylesheet.cssRules,
      (rule) => selectors.indexOf(rule.selectorText) > -1,
    );
  }
});
