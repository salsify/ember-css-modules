import { run } from '@ember/runloop';
import Component from '@ember/component';
import { layout, classNames } from '@ember-decorators/component';
import { computed as nativeComputed } from '@ember/object';
import setupStyles from '../helpers/render-with-styles';

import { localClassName, localClassNames } from 'ember-css-modules';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { render } from '@ember/test-helpers';

/* global require */
// We test against both stage-1 decorators (the polyfill) and stage-2 (@ember-decorators/object @ 5)
const computed = require.has('@ember-decorators/object')
  ? require(['@ember-decorators', 'object'].join('/')).computed
  : nativeComputed;

module('Integration | decorators', function (hooks) {
  setupRenderingTest(hooks);

  test('it honors a configured localClassName', async function (assert) {
    let hbs = setupStyles({
      foo: 'bar',
    });

    @layout(hbs``)
    @classNames('test-component')
    @localClassNames('foo')
    class TestComponent extends Component {}

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component}}`);

    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('buzz');
  });

  test('it honors a configured simple localClassNameBinding', async function (assert) {
    let hbs = setupStyles({
      'dynamic-value': 'foo',
    });

    this.set('flag', true);

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component.extend({}) {
      @localClassName dynamicValue = this.dynamicValue;
    }

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').hasClass('foo');
    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
  });

  test('it honors a configured mapped localClassNameBinding', async function (assert) {
    let hbs = setupStyles({
      'dynamic-value': 'foo',
      'other-class': 'bar',
    });

    this.set('flag', true);

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      @localClassName('other-class') dynamicValue = this.dynamicValue;
    }

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component dynamicValue=flag}}`);

    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').hasClass('bar');

    run(() => this.set('flag', false));
    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');
  });

  test('it honors a configured mapped localClassNameBinding with an inverse', async function (assert) {
    let hbs = setupStyles({
      'dynamic-value': 'foo',
      'other-class': 'bar',
      'different-class': 'baz',
    });

    this.set('flag', true);

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      @localClassName('other-class', 'different-class') dynamicValue =
        this.dynamicValue;
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

  test('it supports localClassNames with composition', async function (assert) {
    let hbs = setupStyles({
      'some-class': 'foo bar baz',
    });

    @layout(hbs``)
    @classNames('test-component')
    @localClassNames('some-class')
    class TestComponent extends Component {}

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component}}`);

    assert.dom('.test-component').hasClass('foo');
    assert.dom('.test-component').hasClass('bar');
    assert.dom('.test-component').hasClass('baz');
  });

  test('it supports localClassNameBindings with composition in the positive class', async function (assert) {
    let hbs = setupStyles({
      'on-class': 'foo bar',
      'off-class': 'baz',
    });

    this.set('flag', true);

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      @localClassName('on-class', 'off-class') dynamicValue = this.dynamicValue;
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

  test('it supports localClassNameBindings with composition in the negative class', async function (assert) {
    let hbs = setupStyles({
      'on-class': 'foo',
      'off-class': 'bar baz',
    });

    this.set('flag', true);

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      @localClassName('on-class', 'off-class') dynamicValue = this.dynamicValue;
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

  test('it honors a configured mapped localClassNameBinding string', async function (assert) {
    let hbs = setupStyles({
      'dynamic-class-name': 'foo',
      'other-dynamic-class-name': 'bar',
    });

    this.set('cls', 'dynamic-class-name');

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      @localClassName cls = this.cls;
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

  test('it can decorate a simple ES5 getter', async function (assert) {
    let hbs = setupStyles({
      'simple-bool-class': 'simple-bool--true',

      'bool-true': 'explicit-bool--true',
      'bool-false': 'explicit-bool--false',

      foo: 'string--foo',
      bar: 'string--bar',
    });

    this.setProperties({
      simpleBool: false,
      explicitBool: false,
      string: null,
    });

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      simpleBool;
      explicitBool;
      string;

      @localClassName
      get simpleBoolClass() {
        return this.simpleBool;
      }

      @localClassName('bool-true', 'bool-false')
      get explicitBoolClass() {
        return this.explicitBool;
      }

      @localClassName
      get stringClass() {
        return this.string;
      }

      didReceiveAttrs() {
        super.didReceiveAttrs();
        // Since these are just plain getter, which don't have a dependency
        // mapping and change tracking, we need to tell Ember that the world
        // has changed and a re-render is required.
        this.notifyPropertyChange('simpleBoolClass');
        this.notifyPropertyChange('explicitBoolClass');
        this.notifyPropertyChange('stringClass');
      }
    }

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component
      simpleBool=simpleBool
      explicitBool=explicitBool
      string=string
    }}`);

    assert.dom('.test-component').doesNotHaveClass('simple-bool--true');

    assert.dom('.test-component').doesNotHaveClass('explicit-bool--true');
    assert.dom('.test-component').hasClass('explicit-bool--false');

    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');

    run(() => this.set('simpleBool', true));
    assert.dom('.test-component').hasClass('simple-bool--true');

    run(() => this.set('explicitBool', true));
    assert.dom('.test-component').hasClass('explicit-bool--true');
    assert.dom('.test-component').doesNotHaveClass('explicit-bool--false');

    run(() => this.set('string', 'foo'));
    assert.dom('.test-component').hasClass('string--foo');
    assert.dom('.test-component').doesNotHaveClass('string--bar');

    run(() => this.set('string', 'bar'));
    assert.dom('.test-component').doesNotHaveClass('string--foo');
    assert.dom('.test-component').hasClass('string--bar');
  });

  test('it can decorate a computed property', async function (assert) {
    let hbs = setupStyles({
      'simple-bool-class': 'simple-bool--true',

      'bool-true': 'explicit-bool--true',
      'bool-false': 'explicit-bool--false',

      foo: 'string--foo',
      bar: 'string--bar',
    });

    this.setProperties({
      simpleBool: false,
      explicitBool: false,
      string: null,
    });

    @layout(hbs``)
    @classNames('test-component')
    class TestComponent extends Component {
      simpleBool;
      explicitBool;
      string;

      @localClassName
      @computed('simpleBool')
      get simpleBoolClass() {
        return this.simpleBool;
      }

      @localClassName('bool-true', 'bool-false')
      @computed('explicitBool')
      get explicitBoolClass() {
        return this.explicitBool;
      }

      @localClassName
      @computed('string')
      get stringClass() {
        return this.string;
      }
    }

    this.owner.register('component:test-component', TestComponent);

    await render(hbs`{{test-component
      simpleBool=simpleBool
      explicitBool=explicitBool
      string=string
    }}`);

    assert.dom('.test-component').doesNotHaveClass('simple-bool--true');

    assert.dom('.test-component').doesNotHaveClass('explicit-bool--true');
    assert.dom('.test-component').hasClass('explicit-bool--false');

    assert.dom('.test-component').doesNotHaveClass('foo');
    assert.dom('.test-component').doesNotHaveClass('bar');

    run(() => this.set('simpleBool', true));
    assert.dom('.test-component').hasClass('simple-bool--true');

    run(() => this.set('explicitBool', true));
    assert.dom('.test-component').hasClass('explicit-bool--true');
    assert.dom('.test-component').doesNotHaveClass('explicit-bool--false');

    run(() => this.set('string', 'foo'));
    assert.dom('.test-component').hasClass('string--foo');
    assert.dom('.test-component').doesNotHaveClass('string--bar');

    run(() => this.set('string', 'bar'));
    assert.dom('.test-component').doesNotHaveClass('string--foo');
    assert.dom('.test-component').hasClass('string--bar');
  });
});
