import { run } from '@ember/runloop';
import Component from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

import ComponentMixin from 'ember-css-modules/mixins/component-mixin';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { render } from '@ember/test-helpers';

import podStyles from 'dummy/components/testing/pod-component/styles';
import rootPodStyles from 'dummy/testing/root-pod-component/styles';
import classicStyles from 'dummy/styles/components/testing/classic-component';

module('Integration | Mixin | component mixin', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.registerOptionsForType('styles', { instantiate: false });
  });

  test('it exposes a computed __styles__ property for pod components', function (assert) {
    let subject = this.owner.lookup('component:testing/pod-component');
    assert.equal(subject.get('__styles__'), podStyles);
  });

  test('it exposes a computed __styles__ property for pod components outside components/', function (assert) {
    let subject = this.owner.lookup('component:testing/root-pod-component');
    assert.equal(subject.get('__styles__'), rootPodStyles);
  });

  test('it exposes a computed __styles__ property for classic components', function (assert) {
    let subject = this.owner.lookup('component:testing/classic-component');
    assert.equal(subject.get('__styles__'), classicStyles);
  });

  test('it honors a configured localClassName', async function (assert) {
    let styles = {
      foo: 'bar',
    };

    this.owner.register(
      'component:test-component',
      Component.extend(ComponentMixin, {
        __styles__: styles,
        classNames: 'test-component',
        localClassNames: 'foo',
      })
    );

    await render(hbs`{{test-component}}`);

    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('buzz');
  });

  test('it honors a configured simple localClassNameBinding', async function (assert) {
    let styles = {
      'dynamic-value': 'foo',
    };

    this.set('flag', true);

    this.owner.register(
      'component:test-component',
      Component.extend(ComponentMixin, {
        __styles__: styles,
        classNames: 'test-component',
        localClassNameBindings: 'dynamicValue',
      })
    );

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').hasClass('foo');

    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
  });

  test('it honors a configured mapped localClassNameBinding', async function (assert) {
    let styles = {
      'dynamic-value': 'foo',
      'other-class': 'bar',
    };

    this.set('flag', true);

    this.owner.register(
      'component:test-component',
      Component.extend(ComponentMixin, {
        __styles__: styles,
        classNames: 'test-component',
        localClassNameBindings: 'dynamicValue:other-class',
      })
    );

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').hasClass('bar');

    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');
  });

  test('it honors a configured mapped localClassNameBinding with an inverse', async function (assert) {
    let styles = {
      'dynamic-value': 'foo',
      'other-class': 'bar',
      'different-class': 'baz',
    };

    this.set('flag', true);

    this.owner.register(
      'component:test-component',
      Component.extend(ComponentMixin, {
        __styles__: styles,
        classNames: 'test-component',
        localClassNameBindings: 'dynamicValue:other-class:different-class',
      })
    );

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').doesNotHaveClass('baz');

    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');
    assert.dom('.test-component').hasClass('baz');
  });

  test('it supports localClassNames with composition', async function (assert) {
    let styles = {
      'some-class': 'foo bar baz',
    };

    this.owner.register(
      'component:test-component',
      Component.extend(ComponentMixin, {
        __styles__: styles,
        classNames: 'test-component',
        localClassNames: 'some-class',
      })
    );

    await render(hbs`{{test-component}}`);

    assert.dom('.test-component').hasClass('foo');
    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').hasClass('baz');
  });

  test('it supports localClassNameBindings with composition in the positive class', async function (assert) {
    let styles = {
      'on-class': 'foo bar',
      'off-class': 'baz',
    };

    this.set('flag', true);

    this.owner.register(
      'component:test-component',
      Component.extend(ComponentMixin, {
        __styles__: styles,
        classNames: 'test-component',
        localClassNameBindings: 'dynamicValue:on-class:off-class',
      })
    );

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').hasClass('foo');
    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').doesNotHaveClass('baz');

    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');
    assert.dom('.test-component').hasClass('baz');
  });

  test('it supports localClassNameBindings with composition in the negative class', async function (assert) {
    let styles = {
      'on-class': 'foo',
      'off-class': 'bar baz',
    };

    this.set('flag', true);

    this.owner.register(
      'component:test-component',
      Component.extend(ComponentMixin, {
        __styles__: styles,
        classNames: 'test-component',
        localClassNameBindings: 'dynamicValue:on-class:off-class',
      })
    );

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').hasClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');
    assert.dom('.test-component').doesNotHaveClass('baz');

    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').hasClass('baz');
  });

  test('it honors a configured mapped localClassNameBinding string', async function (assert) {
    let styles = {
      'dynamic-class-name': 'foo',
      'other-dynamic-class-name': 'bar',
    };

    this.set('cls', 'dynamic-class-name');

    this.owner.register(
      'component:test-component',
      Component.extend(ComponentMixin, {
        __styles__: styles,
        classNames: 'test-component',
        localClassNameBindings: 'cls',
      })
    );

    await render(hbs`{{test-component cls=cls}}`);

    assert.dom('.test-component').hasClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');

    run(() => this.set('cls', 'other-dynamic-class-name'));
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').hasClass('bar');

    run(() => this.set('cls', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');
  });
});
