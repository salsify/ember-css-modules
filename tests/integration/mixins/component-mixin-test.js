import { run } from '@ember/runloop';
import Component from '@ember/component';
import { getOwner } from '@ember/application';
import hbs from 'htmlbars-inline-precompile';

import ComponentMixin from 'ember-css-modules/mixins/component-mixin';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('', 'Integration | Mixin | component mixin', {
  integration: true,

  beforeEach() {
    this.owner = getOwner(this);
    this.owner.registerOptionsForType('styles', { instantiate: false });
  }
});

test('it exposes a computed __styles__ property', function(assert) {
  let styles = {};

  this.owner.register('component:test-component', Component.extend(ComponentMixin));
  this.owner.register('styles:components/test-component', styles);

  let subject = this.owner.lookup('component:test-component');

  assert.equal(subject.get('__styles__'), styles);
});

test('it honors a configured localClassName', function(assert) {
  let styles = {
    foo: 'bar'
  };

  this.owner.register('styles:components/test-component', styles);
  this.owner.register('component:test-component', Component.extend(ComponentMixin, {
    classNames: 'test-component',
    localClassNames: 'foo'
  }));

  this.render(hbs`{{test-component}}`);

  let $element = this.$('.test-component');

  assert.ok($element.is('.bar'));
  assert.notOk($element.is('.foo'));
  assert.notOk($element.is('.buzz'));
});

test('it honors a configured simple localClassNameBinding', function(assert) {
  let styles = {
    'dynamic-value': 'foo'
  };

  this.set('flag', true);

  this.owner.register('styles:components/test-component', styles);
  this.owner.register('component:test-component', Component.extend(ComponentMixin, {
    classNames: 'test-component',
    localClassNameBindings: 'dynamicValue'
  }));

  this.render(hbs`{{test-component dynamicValue=flag}}`);

  let $element = this.$('.test-component');
  assert.ok($element.is('.foo'));

  run(() => this.set('flag', false));
  assert.notOk($element.is('.foo'));
});

test('it honors a configured mapped localClassNameBinding', function(assert) {
  let styles = {
    'dynamic-value': 'foo',
    'other-class': 'bar'
  };

  this.set('flag', true);

  this.owner.register('styles:components/test-component', styles);
  this.owner.register('component:test-component', Component.extend(ComponentMixin, {
    classNames: 'test-component',
    localClassNameBindings: 'dynamicValue:other-class'
  }));

  this.render(hbs`{{test-component dynamicValue=flag}}`);

  let $element = this.$('.test-component');
  assert.notOk($element.is('.foo'));
  assert.ok($element.is('.bar'));

  run(() => this.set('flag', false));
  assert.notOk($element.is('.foo'));
  assert.notOk($element.is('.bar'));
});

test('it honors a configured mapped localClassNameBinding with an inverse', function(assert) {
  let styles = {
    'dynamic-value': 'foo',
    'other-class': 'bar',
    'different-class': 'baz'
  };

  this.set('flag', true);

  this.owner.register('styles:components/test-component', styles);
  this.owner.register('component:test-component', Component.extend(ComponentMixin, {
    classNames: 'test-component',
    localClassNameBindings: 'dynamicValue:other-class:different-class'
  }));

  this.render(hbs`{{test-component dynamicValue=flag}}`);

  let $element = this.$('.test-component');
  assert.notOk($element.is('.foo'));
  assert.ok($element.is('.bar'));
  assert.notOk($element.is('.baz'));

  run(() => this.set('flag', false));
  assert.notOk($element.is('.foo'));
  assert.notOk($element.is('.bar'));
  assert.ok($element.is('.baz'));
});

test('it supports localClassNames with composition', function(assert) {
  let styles = {
    'some-class': 'foo bar baz'
  };

  this.owner.register('styles:components/test-component', styles);
  this.owner.register('component:test-component', Component.extend(ComponentMixin, {
    classNames: 'test-component',
    localClassNames: 'some-class'
  }));

  this.render(hbs`{{test-component}}`);

  let $element = this.$('.test-component');
  assert.ok($element.is('.foo'));
  assert.ok($element.is('.bar'));
  assert.ok($element.is('.baz'));
});

test('it supports localClassNameBindings with composition in the positive class', function(assert) {
  let styles = {
    'on-class': 'foo bar',
    'off-class': 'baz'
  };

  this.set('flag', true);

  this.owner.register('styles:components/test-component', styles);
  this.owner.register('component:test-component', Component.extend(ComponentMixin, {
    classNames: 'test-component',
    localClassNameBindings: 'dynamicValue:on-class:off-class'
  }));

  this.render(hbs`{{test-component dynamicValue=flag}}`);

  let $element = this.$('.test-component');
  assert.ok($element.is('.foo'));
  assert.ok($element.is('.bar'));
  assert.notOk($element.is('.baz'));

  run(() => this.set('flag', false));
  assert.notOk($element.is('.foo'));
  assert.notOk($element.is('.bar'));
  assert.ok($element.is('.baz'));
});

test('it supports localClassNameBindings with composition in the negative class', function(assert) {
  let styles = {
    'on-class': 'foo',
    'off-class': 'bar baz'
  };

  this.set('flag', true);

  this.owner.register('styles:components/test-component', styles);
  this.owner.register('component:test-component', Component.extend(ComponentMixin, {
    classNames: 'test-component',
    localClassNameBindings: 'dynamicValue:on-class:off-class'
  }));

  this.render(hbs`{{test-component dynamicValue=flag}}`);

  let $element = this.$('.test-component');
  assert.ok($element.is('.foo'));
  assert.notOk($element.is('.bar'));
  assert.notOk($element.is('.baz'));

  run(() => this.set('flag', false));
  assert.notOk($element.is('.foo'));
  assert.ok($element.is('.bar'));
  assert.ok($element.is('.baz'));
});
