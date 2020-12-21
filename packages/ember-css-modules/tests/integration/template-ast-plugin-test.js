import { helper } from '@ember/component/helper';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@ember/test-helpers';
import setupStyles from '../helpers/render-with-styles';

module('Integration | Template AST Plugin', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('template:components/x-div', hbs`{{yield}}`);
    this.owner.register('component:x-div', Component.extend({ attributeBindings: ['data-test-value'] }));
    this.owner.register('helper:custom-helper', helper((params, hash) => {
      const values = Object.keys(hash).map(key => hash[key]);
      return params.concat(values).join(' ');
    }));
  });

  testTransformation('local-class helper with no source specified', {
    elementInput: 'data-test-value="{{local-class "foo"}}"',
    statementInput: 'data-test-value=(local-class "foo")',
    output: 'data-test-value="bar"',

    selector: '[data-test-value=bar]',
    styles: {
      foo: 'bar'
    }
  });

  testTransformation('local-class helper with a source specified', {
    elementInput: 'data-test-value="{{local-class "foo" from=otherStyles}}"',
    statementInput: 'data-test-value=(local-class "foo" from=otherStyles)',
    output: 'data-test-value="baz"',

    selector: '[data-test-value=baz]',
    styles: {
      foo: 'bar'
    },
    properties: {
      otherStyles: {
        foo: 'baz'
      }
    }
  });

  testTransformation('creating a class attribute', {
    input: 'local-class="foo"',
    output: 'class="--foo"',

    selector: '.--foo',
    styles: {
      foo: '--foo'
    }
  });

  testTransformation('creating a class attribute with multiple classes', {
    input: 'local-class="foo bar"',
    output: 'class="--foo --bar"',

    selector: '.--foo.--bar',
    styles: {
      foo: '--foo',
      bar: '--bar'
    }
  });

  testTransformation('appending to a class attribute', {
    input: 'class="x" local-class="foo"',
    output: 'class="x --foo"',

    selector: '.x.--foo',
    styles: {
      foo: '--foo'
    }
  });

  testTransformation('appending to a class attribute with multiple classes', {
    input: 'class="x" local-class="foo bar"',
    output: 'class="x --foo --bar"',

    selector: '.x.--foo.--bar',
    styles: {
      foo: '--foo',
      bar: '--bar'
    }
  });

  testTransformation('appending to an unquoted string literal class attribute', {
    input: 'class=x local-class="foo"',
    elementOutput: 'class="x --foo"',

    selector: '.x.--foo',
    styles: {
      foo: '--foo'
    }
  });

  testTransformation('appending to an unquoted string literal class attribute with multiple classes', {
    input: 'class=x local-class="foo bar"',
    elementOutput: 'class="x --foo --bar"',

    selector: '.x.--foo.--bar',
    styles: {
      foo: '--foo',
      bar: '--bar'
    }
  });

  testTransformation('appending a ConcatStatement class', {
    input: 'class="x {{y}}" local-class="foo"',
    elementOutput: 'class="x --y --foo"',

    selector: '.x.--y.--foo',
    styles: {
      foo: '--foo'
    },
    properties: {
      y: '--y',
    }
  });

  testTransformation('appending a static class with a ConcatStatement local-class', {
    input: 'class="x" local-class="foo {{variable}}"',
    elementOutput: 'class="x --foo --bar"',

    selector: '.x.--foo.--bar',
    styles: {
      foo: '--foo',
      bar: '--bar'
    },
    properties: {
      x: '--x',
      variable: 'bar',
    }
  });

  testTransformation('creating a class attribute with dynamic local-class value', {
    statementInput: 'local-class=(custom-helper positional "bar" keyA=named keyB="qux")',
    elementInput: 'local-class={{custom-helper positional "bar" keyA=named keyB="qux"}}',
    output: 'class="--foo --bar --baz --qux"',

    selector: '.--foo.--bar.--baz.--qux',
    styles: {
      foo: '--foo',
      bar: '--bar',
      baz: '--baz',
      qux: '--qux'
    },
    properties: {
      positional: 'foo',
      named: 'baz'
    }
  });

  testTransformation('creating a class attribute with mixed local-class value', {
    statementInput: 'local-class=(concat "foo " (custom-helper positional "bar" keyA=named keyB="qux"))',
    elementInput: 'local-class="foo {{custom-helper positional "bar" keyA=named keyB="qux"}}"',
    output: 'class="--foo --fizz --bar --baz --qux"',

    selector: '.--foo.--fizz.--bar.--baz.--qux',
    styles: {
      foo: '--foo',
      bar: '--bar',
      baz: '--baz',
      qux: '--qux',
      fizz: '--fizz'
    },
    properties: {
      positional: 'fizz',
      named: 'baz',
    }
  });

  testTransformation('appending a class attribute with dynamic local-class value', {
    statementInput: 'class="x" local-class=(custom-helper positional "bar" keyA=named keyB="qux")',
    elementInput: 'class="x" local-class={{custom-helper positional "bar" keyA=named keyB="qux"}}',
    output: 'class="x --foo --bar --baz --qux"',

    selector: '.x.--foo.--bar.--baz.--qux',
    styles: {
      foo: '--foo',
      bar: '--bar',
      baz: '--baz',
      qux: '--qux'
    },
    properties: {
      positional: 'foo',
      named: 'baz'
    }
  });

  testTransformation('appending a class attribute with mixed local-class value', {
    statementInput: 'class="x" local-class=(concat "foo " (custom-helper positional "bar" keyA=named keyB="qux"))',
    elementInput: 'class="x" local-class="foo {{custom-helper positional "bar" keyA=named keyB="qux"}}"',
    output: 'class="x --foo --fizz --bar --baz --qux"',

    selector: '.x.--foo.--bar.--baz.--qux',
    styles: {
      foo: '--foo',
      bar: '--bar',
      baz: '--baz',
      qux: '--qux',
      fizz: '--fizz'
    },
    properties: {
      positional: 'fizz',
      named: 'baz'
    }
  });

  testTransformation('appending a path class attribute', {
    statementInput: 'class=x local-class="foo"',
    elementInput: 'class={{x}} local-class="foo"',
    output: 'class="--x --foo"',

    selector: '.--x.--foo',
    styles: {
      foo: '--foo'
    },
    properties: {
      x: '--x'
    }
  });

  testTransformation('appending a helper class attribute', {
    statementInput: 'class=(concat "x") local-class="foo"',
    elementInput: 'class={{concat "x"}} local-class="foo"',
    output: 'class="x --foo"',

    selector: '.x.--foo',
    styles: {
      foo: '--foo'
    }
  });

  function testTransformation(title, {
    properties,
    styles,
    selector,
    input,
    output,
    elementOutput = output,
    statementOutput = output,
    elementInput = input,
    statementInput = input
  }) {
    test(title, async function(assert) {
      const compile = setupStyles(styles);

      const assertTransforms = async (template, type, input, output) => {
        const inputString = template.replace('[ATTRS]', input);
        const outputString = template.replace('[ATTRS]', output);

        await render(compile(outputString));
        assert.ok(this.element.querySelector(selector), 'Expected output contains verification selector');
        const expected = this.element.outerHTML.replace(/id="\w+"/g, '');

        await render(compile(inputString));
        assert.ok(this.element.querySelector(selector), 'Actual output contains verification selector');
        const actual = this.element.outerHTML.replace(/id="\w+"/g, '');

        assert.equal(actual, expected, `Works for ${type}`);
      };

      if (properties) {
        this.setProperties(properties);
      }

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
