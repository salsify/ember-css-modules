import { test } from 'qunit';
import $ from 'jquery';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | component styles lookup');

var componentRoutes = [
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

var controllerRoutes = [
  'classic-route',
  'classic-template-only-route',
  'pod-route',
  'pod-template-only-route'
].map(name => [name, `/testing/${name}`]);


[...componentRoutes, ...controllerRoutes].forEach(([name, route]) => {
  test(name, function(assert) {
    visit(route);

    andThen(() => {
      let testElement = $('[data-test-element]').get(0);
      assert.ok(testElement);

      let styles = window.getComputedStyle(testElement);
      assert.equal(styles.fontFamily.replace(/['"]/g, ''), name);
    });
  });
});
