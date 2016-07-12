import { test } from 'qunit';
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
  'component-with-explicit-styles-reference',
  'component-with-global-class-composition',
  'component-with-container-class'
].map(name => [name, `/render-component/${name}`]);

var controllerRoutes = [
  'classic-route',
  'classic-template-only-route',
  'pod-route',
  'pod-template-only-route'
].map(name => [name, `/${name}`]);


[...componentRoutes, ...controllerRoutes].forEach(([name, route]) => {
  test(name, function(assert) {
    visit(route);

    andThen(function() {
      let testElement = this.$('[data-test-element]').get(0);
      assert.ok(testElement);

      let styles = window.getComputedStyle(testElement);
      assert.equal(styles.fontFamily.replace(/['"]/g, ''), name);
    });
  });
});
