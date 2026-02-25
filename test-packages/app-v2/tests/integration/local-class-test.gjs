import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import TestComponent from 'app-v2/components/test-component';
import V1AddonComponent from 'addon-v1/components/v1-addon-component';
import V1AddonToc from 'addon-v1/components/v1-addon-toc';
import V2AddonComponent from 'addon-v2/components/v2-addon-component';
import V2AddonToc from 'addon-v2/components/v2-addon-toc';

module('Integration | style imports', function (hooks) {
  setupRenderingTest(hooks);

  test('v2 app component', async function (assert) {
    await render(
      <template>
        <TestComponent><div data-test>hi</div></TestComponent>
      </template>
    );

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'test-component');
  });

  test('v1 addon component with backing class', async function (assert) {
    await render(
      <template>
        <V1AddonComponent><div data-test>hi</div></V1AddonComponent>
      </template>
    );

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'v1-addon-component');
  });

  test('v1 addon template-only component', async function (assert) {
    await render(
      <template>
        <V1AddonToc><div data-test>hi</div></V1AddonToc>
      </template>
    );

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'v1-addon-toc');
  });

  test('v2 addon component with backing class', async function (assert) {
    await render(
      <template>
        <V2AddonComponent><div data-test>hi</div></V2AddonComponent>
      </template>
    );

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'v2-addon-component');
  });

  test('v2 addon template-only component', async function (assert) {
    await render(
      <template>
        <V2AddonToc><div data-test>hi</div></V2AddonToc>
      </template>
    );

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'v2-addon-toc');
  });
});
