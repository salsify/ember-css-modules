import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | template association', function (hooks) {
  setupRenderingTest(hooks);

  test('classic layout', async function (assert) {
    await render(hbs`
      <ClassicComponent><div data-test>hi</div></ClassicComponent>
    `);

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'classic-component');
  });

  test('pod layout', async function (assert) {
    await render(hbs`
      <PodComponent><div data-test>hi</div></PodComponent>
    `);

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'pod-component');
  });

  test('colocated layout', async function (assert) {
    await render(hbs`
      <ColocatedComponent><div data-test>hi</div></ColocatedComponent>
    `);

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'colocated-component');
  });

  test('template-only', async function (assert) {
    await render(hbs`
      <TemplateOnlyComponent><div data-test>hi</div></TemplateOnlyComponent>
    `);

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'template-only-component');
  });

  test('TypeScript', async function (assert) {
    await render(hbs`
      <TypeScriptComponent><div data-test>hi</div></TypeScriptComponent>
    `);

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'type-script-component');
  });

  test('GJS', async function (assert) {
    await render(hbs`
      <GjsComponent><div data-test>hi</div></GjsComponent>
    `);

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'gjs-component');
  });

  test('v1 addon component with backing class', async function (assert) {
    await render(hbs`
      <V1AddonComponent><div data-test>hi</div></V1AddonComponent>
    `);

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'v1-addon-component');
  });

  test('v1 addon template-only component', async function (assert) {
    await render(hbs`
      <V1AddonToc><div data-test>hi</div></V1AddonToc>
    `);

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'v1-addon-toc');
  });

  test('v2 addon component with backing class', async function (assert) {
    await render(hbs`
      <V2AddonComponent><div data-test>hi</div></V2AddonComponent>
    `);

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'v2-addon-component');
  });

  test('v2 addon template-only component', async function (assert) {
    await render(hbs`
      <V2AddonToc><div data-test>hi</div></V2AddonToc>
    `);

    let styles = getComputedStyle(this.element.querySelector('[data-test]'));
    assert.strictEqual(styles.fontFamily, 'v2-addon-toc');
  });
});
