import { run } from '@ember/runloop';
import Component from '@ember/component';
import { layout, classNames } from '@ember-decorators/component';
import setupStyles from '../helpers/render-with-styles';

import { localClassName, localClassNames } from 'ember-css-modules';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { render } from '@ember/test-helpers';

module('Integration | decorators', function(hooks) {
  setupRenderingTest(hooks);

  test('it honors a configured localClassName', async function(assert) {
    let hbs = setupStyles({
      foo: 'bar'
    });

    @layout(hbs``)
    @classNames('test-component')
    @localClassNames('foo')
    class TestComponent extends Component {}

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component}}`);

    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').doesNotHaveClass('foo')
    assert.dom('.test-component').doesNotHaveClass('buzz');
  });

  test('it honors a configured simple localClassNameBinding', async function(assert) {
    let hbs = setupStyles({
      'dynamic-value': 'foo'
    });

    this.set('flag', true);

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component.extend({}) {
      @localClassName dynamicValue;
    }

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').hasClass('foo');
    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
  });

  test('it honors a configured mapped localClassNameBinding', async function(assert) {
    let hbs = setupStyles({
      'dynamic-value': 'foo',
      'other-class': 'bar'
    });

    this.set('flag', true);

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      @localClassName('other-class') dynamicValue;
    }

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').hasClass('bar');

    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');
  });

  test('it honors a configured mapped localClassNameBinding with an inverse', async function(assert) {
    let hbs = setupStyles({
      'dynamic-value': 'foo',
      'other-class': 'bar',
      'different-class': 'baz'
    });

    this.set('flag', true);

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      @localClassName('other-class', 'different-class') dynamicValue;
    }

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').doesNotHaveClass('baz');

    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');
    assert.dom('.test-component').hasClass('baz');
  });

  test('it supports localClassNames with composition', async function(assert) {
    let hbs = setupStyles({
      'some-class': 'foo bar baz'
    });

    @layout(hbs``)
    @classNames('test-component')
    @localClassNames('some-class')
    class TestComponent extends Component { }

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component}}`);

    assert.dom('.test-component').hasClass('foo');
    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').hasClass('baz');
  });

  test('it supports localClassNameBindings with composition in the positive class', async function(assert) {
    let hbs = setupStyles({
      'on-class': 'foo bar',
      'off-class': 'baz'
    });

    this.set('flag', true);

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      @localClassName('on-class', 'off-class') dynamicValue;
    }

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').hasClass('foo');
    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').doesNotHaveClass('baz');

    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');
    assert.dom('.test-component').hasClass('baz');
  });

  test('it supports localClassNameBindings with composition in the negative class', async function(assert) {
    let hbs = setupStyles({
      'on-class': 'foo',
      'off-class': 'bar baz'
    });

    this.set('flag', true);

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      @localClassName('on-class', 'off-class') dynamicValue;
    }

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').hasClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');
    assert.dom('.test-component').doesNotHaveClass('baz');

    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').hasClass('baz');
  });

  test('it honors a configured mapped localClassNameBinding string', async function(assert) {
    let hbs = setupStyles({
      'dynamic-class-name': 'foo',
      'other-dynamic-class-name': 'bar',
    });

    this.set('cls', 'dynamic-class-name');

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      @localClassName cls;
    }

    this.owner.register('component:test-component', TestComponent);

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
