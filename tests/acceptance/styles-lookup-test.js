import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import $ from 'jquery';

module('Acceptance | component styles lookup', function(hooks) {
  setupApplicationTest(hooks);

  const componentRoutes = [
    'root-pod-component',
    'root-pod-template-only-component',
    'classic-component',
    'classic-template-only-component',
    'pod-component',
    'pod-template-only-component',
    'addon-component',
    'pod-route/nested-pod-component',
    'pod-route/nested-pod-template-only-component',
    'component-with-dynamic-local-class',
    'component-with-global-class-and-dynamic-local-class',
    'component-with-local-class-helper',
    'component-with-global-class-composition',
    'component-with-container-class',
    'component-with-addon-value',
    'component-with-addon-composition',
    'sass-addon-component',
    'less-addon-component'
  ].map(name => [name, `/testing/render-component/${name}`]);

  const controllerRoutes = [
    'classic-route',
    'classic-template-only-route',
    'pod-route',
    'pod-template-only-route'
  ].map(name => [name, `/testing/${name}`]);


  [...componentRoutes, ...controllerRoutes].forEach(([name, route]) => {
    test(name, async function(assert) {
      await visit(route);

      let testElement = $('[data-test-element]').get(0);
      assert.ok(testElement);

      let styles = window.getComputedStyle(testElement);
      assert.equal(styles.fontFamily.replace(/['"]/g, ''), name);
    });
  });
});
