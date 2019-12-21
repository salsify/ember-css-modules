import { module, test } from 'qunit';
import { setupApplicationTest, setupRenderingTest } from 'ember-qunit';
import { visit, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Acceptance | styles lookup', function() {
  const components = [
    'root-pod-component',
    'root-pod-template-only-component',
    'classic-component',
    'classic-template-only-component',
    'pod-component',
    'pod-template-only-component',
    'pod-route/nested-pod-component',
    'pod-route/nested-pod-template-only-component',
    'component-with-dynamic-local-class',
    'component-with-global-scope',
    'component-with-global-class-and-dynamic-local-class',
    'component-with-local-class-helper',
    'component-with-global-class-composition',
    'component-with-container-class'
  ];

  const routes = [
    'classic-route',
    'classic-template-only-route',
    'pod-route',
    'pod-template-only-route'
  ];

  module('components', function(hooks) {
    setupRenderingTest(hooks);

    for (let component of components) {
      test(component, async function(assert) {
        this.component = component;
        await render(hbs`{{component (concat 'testing/' this.component)}}`);

        let testElement = this.element.querySelector('[data-test-element]');
        let styles = window.getComputedStyle(testElement);
        assert.equal(styles.fontFamily.replace(/['"]/g, ''), component);
      });
    }
  });

  module('route templates', function(hooks) {
    setupApplicationTest(hooks);

    for (let route of routes) {
      test(route, async function(assert) {
        await visit(`testing/${route}`);

        let testElement = this.element.querySelector('[data-test-element]');
        let styles = window.getComputedStyle(testElement);
        assert.equal(styles.fontFamily.replace(/['"]/g, ''), route);
      });
    }
  });
});
