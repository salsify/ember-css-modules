import { helper } from '@ember/component/helper';
import Component from '@ember/component';
import Ember from 'ember';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@ember/test-helpers';
import { VERSION } from '@ember/version';

import ClassTransformPlugin from 'npm:../../lib/htmlbars-plugin';
const { compile } = Ember.__loader.require('ember-template-compiler');

module('Integration | Template AST Plugin', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('template:components/x-div', hbs`{{yield}}`);
    this.owner.register('component:x-div', Component.extend({ attributeBindings: ['data-test-value'] }));
    this.owner.register('helper:helper', helper((params, hash) => {
      const values = Object.keys(hash).map(key => hash[key]);
      return params.concat(values).join(' ');
    }));
  });

  testTransformation('local-class helper with no source specified', {
    elementInput: 'data-test-value="{{local-class "foo"}}"',
    elementOutput: 'data-test-value="{{local-class "foo" from=(unbound __styles__)}}"',
    statementInput: 'data-test-value=(local-class "foo")',
    statementOutput: 'data-test-value=(local-class "foo" from=(unbound __styles__))',

    selector: '[data-test-value=bar]',
    properties: {
      __styles__: {
        foo: 'bar'
      }
    }
  });

  testTransformation('local-class helper with a source specified', {
    elementInput: 'data-test-value="{{local-class "foo" from=otherStyles}}"',
    elementOutput: 'data-test-value="{{local-class "foo" from=otherStyles}}"',
    statementInput: 'data-test-value=(local-class "foo" from=otherStyles)',
    statementOutput: 'data-test-value=(local-class "foo" from=otherStyles)',

    selector: '[data-test-value=baz]',
    properties: {
      otherStyles: {
        foo: 'baz'
      },
      __styles__: {
        foo: 'bar'
      }
    }
  });

  testTransformation('creating a class attribute', {
    input: 'local-class="foo"',
    statementOutput: 'class=(concat (unbound __styles__.foo))', // FIXME superfluous concat
    elementOutput: 'class="{{unbound __styles__.foo}}"',

    selector: '.--foo',
    properties: {
      __styles__: {
        foo: '--foo'
      }
    }
  });

  testTransformation('creating a class attribute with multiple classes', {
    input: 'local-class="foo bar"',
    statementOutput: 'class=(concat (unbound __styles__.foo) " " (unbound __styles__.bar))',
    elementOutput: 'class="{{unbound __styles__.foo}} {{unbound __styles__.bar}}"',

    selector: '.--foo.--bar',
    properties: {
      __styles__: {
        foo: '--foo',
        bar: '--bar'
      }
    }
  });

  testTransformation('appending to a class attribute', {
    input: 'class="x" local-class="foo"',
    statementOutput: 'class=(concat "x " (unbound __styles__.foo))',
    elementOutput: 'class="x {{unbound __styles__.foo}}"',

    selector: '.x.--foo',
    properties: {
      __styles__: {
        foo: '--foo'
      }
    }
  });

  testTransformation('appending to a class attribute with multiple classes', {
    input: 'class="x" local-class="foo bar"',
    statementOutput: 'class=(concat "x " (unbound __styles__.foo) " " (unbound __styles__.bar))',
    elementOutput: 'class="x {{unbound __styles__.foo}} {{unbound __styles__.bar}}"',

    selector: '.x.--foo.--bar',
    properties: {
      __styles__: {
        foo: '--foo',
        bar: '--bar'
      }
    }
  });

  testTransformation('appending to an unquoted string literal class attribute', {
    input: 'class=x local-class="foo"',
    elementOutput: 'class="x {{unbound __styles__.foo}}"',

    selector: '.x.--foo',
    properties: {
      __styles__: {
        foo: '--foo'
      }
    }
  });

  testTransformation('appending to an unquoted string literal class attribute with multiple classes', {
    input: 'class=x local-class="foo bar"',
    elementOutput: 'class="x {{unbound __styles__.foo}} {{unbound __styles__.bar}}"',

    selector: '.x.--foo.--bar',
    properties: {
      __styles__: {
        foo: '--foo',
        bar: '--bar'
      }
    }
  });

  testTransformation('appending a ConcatStatement class', {
    input: 'class="x {{y}}" local-class="foo"',
    elementOutput: 'class="{{concat "x " y}} {{unbound __styles__.foo}}"',

    selector: '.x.--y.--foo',
    properties: {
      y: '--y',
      __styles__: {
        foo: '--foo'
      }
    }
  });

  testTransformation('appending a static class with a ConcatStatement local-class', {
    input: 'class="x" local-class="foo {{variable}}"',
    elementOutput: 'class="x {{local-class (concat "foo " variable) from=(unbound __styles__)}}"',

    selector: '.x.--foo.--bar',
    properties: {
      x: '--x',
      variable: 'bar',
      __styles__: {
        foo: '--foo',
        bar: '--bar'
      }
    }
  });

  testTransformation('creating a class attribute with dynamic local-class value', {
    statementInput: 'local-class=(helper positional "bar" keyA=named keyB="qux")',
    statementOutput: 'class=(concat (local-class (helper positional "bar" keyA=named keyB="qux") from=(unbound __styles__)))',
    elementInput: 'local-class={{helper positional "bar" keyA=named keyB="qux"}}',
    elementOutput: 'class="{{local-class (helper positional "bar" keyA=named keyB="qux") from=(unbound __styles__)}}"',

    selector: '.--foo.--bar.--baz.--qux',
    properties: {
      positional: 'foo',
      named: 'baz',
      __styles__: {
        foo: '--foo',
        bar: '--bar',
        baz: '--baz',
        qux: '--qux'
      }
    }
  });

  testTransformation('creating a class attribute with mixed local-class value', {
    statementInput: 'local-class=(concat "foo " (helper positional "bar" keyA=named keyB="qux"))',
    statementOutput: 'class=(concat (local-class (concat "foo " (helper positional "bar" keyA=named keyB="qux")) from=(unbound __styles__)))',
    elementInput: 'local-class="foo {{helper positional "bar" keyA=named keyB="qux"}}"',
    elementOutput: 'class="{{local-class (concat "foo " (helper positional "bar" keyA=named keyB="qux")) from=(unbound __styles__)}}"',

    selector: '.--foo.--bar.--baz.--qux',
    properties: {
      positional: 'foo',
      named: 'baz',
      __styles__: {
        foo: '--foo',
        bar: '--bar',
        baz: '--baz',
        qux: '--qux'
      }
    }
  });

  testTransformation('appending a class attribute with dynamic local-class value', {
    statementInput: 'class="x" local-class=(helper positional "bar" keyA=named keyB="qux")',
    statementOutput: 'class=(concat "x " (local-class (helper positional "bar" keyA=named keyB="qux") from=(unbound __styles__)))',
    elementInput: 'class="x" local-class={{helper positional "bar" keyA=named keyB="qux"}}',
    elementOutput: 'class="x {{local-class (helper positional "bar" keyA=named keyB="qux") from=(unbound __styles__)}}"',

    selector: '.x.--foo.--bar.--baz.--qux',
    properties: {
      positional: 'foo',
      named: 'baz',
      __styles__: {
        foo: '--foo',
        bar: '--bar',
        baz: '--baz',
        qux: '--qux'
      }
    }
  });

  testTransformation('appending a class attribute with mixed local-class value', {
    statementInput: 'class="x" local-class=(concat "foo " (helper positional "bar" keyA=named keyB="qux"))',
    statementOutput: 'class=(concat "x " (local-class (concat "foo " (helper positional "bar" keyA=named keyB="qux")) from=(unbound __styles__)))',
    elementInput: 'class="x" local-class="foo {{helper positional "bar" keyA=named keyB="qux"}}"',
    elementOutput: 'class="x {{local-class (concat "foo " (helper positional "bar" keyA=named keyB="qux")) from=(unbound __styles__)}}"',

    selector: '.x.--foo.--bar.--baz.--qux',
    properties: {
      positional: 'foo',
      named: 'baz',
      __styles__: {
        foo: '--foo',
        bar: '--bar',
        baz: '--baz',
        qux: '--qux'
      }
    }
  });

  testTransformation('appending a path class attribute', {
    statementInput: 'class=x local-class="foo"',
    statementOutput: 'class=(concat x " " (unbound __styles__.foo))',
    elementInput: 'class={{x}} local-class="foo"',
    elementOutput: 'class="{{x}} {{unbound __styles__.foo}}"',

    selector: '.--x.--foo',
    properties: {
      x: '--x',
      __styles__: {
        foo: '--foo'
      }
    }
  });

  testTransformation('appending a helper class attribute', {
    statementInput: 'class=(concat "x") local-class="foo"',
    statementOutput: 'class=(concat (concat "x") " " (unbound __styles__.foo))',
    elementInput: 'class={{concat "x"}} local-class="foo"',
    elementOutput: 'class="{{concat "x"}} {{unbound __styles__.foo}}"',

    selector: '.x.--foo',
    properties: {
      __styles__: {
        foo: '--foo'
      }
    }
  });

  function testTransformation(title, {
    properties,
    selector,
    input,
    elementOutput,
    statementOutput,
    elementInput = input,
    statementInput = input
  }) {
    test(title, async function(assert) {
      const assertTransforms = async (template, type, input, output) => {
        const inputString = template.replace('[ATTRS]', input);
        const outputString = template.replace('[ATTRS]', output);

        await render(compile(outputString));
        assert.ok(this.$(selector).length, 'Expected output contains verification selector');
        const expected = this.$().html().replace(/id="\w+"/g, '');

        const plugin = ClassTransformPlugin.forEmberVersion(VERSION);
        await render(compile(inputString, { plugins: { ast: [plugin] } }));
        assert.ok(this.$(selector).length, 'Actual output contains verification selector');
        const actual = this.$().html().replace(/id="\w+"/g, '');

        assert.equal(actual, expected, `Works for ${type}`);
      };

      this.setProperties(properties);

      if (elementOutput) {
        await assertTransforms('<div [ATTRS]></div>', 'ElementNode', elementInput, elementOutput);
      }

      if (statementOutput) {
        await assertTransforms('{{x-div [ATTRS]}}', 'MustacheStatement', statementInput, statementOutput);
        await assertTransforms('{{#x-div [ATTRS]}}{{/x-div}}', 'BlockStatement', statementInput, statementOutput);
      }
    });
  }
});
