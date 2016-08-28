import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import getOwner from 'ember-getowner-polyfill';

import ClassTransformPlugin from 'npm:../../lib/htmlbars-plugin';
const { compile } = Ember.__loader.require('ember-template-compiler');

moduleForComponent('', 'Integration | Template AST Plugin', {
  integration: true,
  beforeEach() {
    const owner = getOwner(this);
    owner.register('template:components/x-div', hbs`{{yield}}`);
    owner.register('helper:helper', Ember.Helper.helper((params, hash) => {
      const values = Object.keys(hash).map(key => hash[key]);
      return params.concat(values).join(' ');
    }));
  }
});

testTransformation('creating a class attribute', {
  input: 'local-class="foo"',
  statementOutput: 'class=(concat (unbound styles.foo))', // FIXME superfluous concat
  elementOutput: 'class="{{unbound styles.foo}}"',

  selector: '.--foo',
  properties: {
    styles: {
      foo: '--foo'
    }
  }
});

testTransformation('creating a class attribute with multiple classes', {
  input: 'local-class="foo bar"',
  statementOutput: 'class=(concat (unbound styles.foo) " " (unbound styles.bar))',
  elementOutput: 'class="{{unbound styles.foo}} {{unbound styles.bar}}"',

  selector: '.--foo.--bar',
  properties: {
    styles: {
      foo: '--foo',
      bar: '--bar'
    }
  }
});

testTransformation('appending to a class attribute', {
  input: 'class="x" local-class="foo"',
  statementOutput: 'class=(concat "x " (unbound styles.foo))',
  elementOutput: 'class="x {{unbound styles.foo}}"',

  selector: '.x.--foo',
  properties: {
    styles: {
      foo: '--foo'
    }
  }
});

testTransformation('appending to a class attribute with multiple classes', {
  input: 'class="x" local-class="foo bar"',
  statementOutput: 'class=(concat "x " (unbound styles.foo) " " (unbound styles.bar))',
  elementOutput: 'class="x {{unbound styles.foo}} {{unbound styles.bar}}"',

  selector: '.x.--foo.--bar',
  properties: {
    styles: {
      foo: '--foo',
      bar: '--bar'
    }
  }
});

testTransformation('appending to an unquoted string literal class attribute', {
  input: 'class=x local-class="foo"',
  elementOutput: 'class="x {{unbound styles.foo}}"',

  selector: '.x.--foo',
  properties: {
    styles: {
      foo: '--foo'
    }
  }
});

testTransformation('appending to an unquoted string literal class attribute with multiple classes', {
  input: 'class=x local-class="foo bar"',
  elementOutput: 'class="x {{unbound styles.foo}} {{unbound styles.bar}}"',

  selector: '.x.--foo.--bar',
  properties: {
    styles: {
      foo: '--foo',
      bar: '--bar'
    }
  }
});

testTransformation('appending a ConcatStatement class', {
  input: 'class="x {{y}}" local-class="foo"',
  elementOutput: 'class="{{concat "x " y}} {{unbound styles.foo}}"',

  selector: '.x.--y.--foo',
  properties: {
    y: '--y',
    styles: {
      foo: '--foo'
    }
  }
});

testTransformation('appending a static class with a ConcatStatement local-class', {
  input: 'class="x" local-class="foo {{variable}}"',
  elementOutput: 'class="x {{lookup-module-styles (unbound styles) (concat "foo " variable)}}"',

  selector: '.x.--foo.--bar',
  properties: {
    x: '--x',
    variable: 'bar',
    styles: {
      foo: '--foo',
      bar: '--bar'
    }
  }
});

testTransformation('creating a class attribute with dynamic local-class value', {
  statementInput: 'local-class=(helper positional "bar" keyA=named keyB="qux")',
  statementOutput: 'class=(concat (lookup-module-styles (unbound styles) (helper positional "bar" keyA=named keyB="qux")))',
  elementInput: 'local-class={{helper positional "bar" keyA=named keyB="qux"}}',
  elementOutput: 'class="{{lookup-module-styles (unbound styles) (helper positional "bar" keyA=named keyB="qux")}}"',

  selector: '.--foo.--bar.--baz.--qux',
  properties: {
    positional: 'foo',
    named: 'baz',
    styles: {
      foo: '--foo',
      bar: '--bar',
      baz: '--baz',
      qux: '--qux'
    }
  }
});

testTransformation('creating a class attribute with mixed local-class value', {
  statementInput: 'local-class=(concat "foo " (helper positional "bar" keyA=named keyB="qux"))',
  statementOutput: 'class=(concat (lookup-module-styles (unbound styles) (concat "foo " (helper positional "bar" keyA=named keyB="qux"))))',
  elementInput: 'local-class="foo {{helper positional "bar" keyA=named keyB="qux"}}"',
  elementOutput: 'class="{{lookup-module-styles (unbound styles) (concat "foo " (helper positional "bar" keyA=named keyB="qux"))}}"',

  selector: '.--foo.--bar.--baz.--qux',
  properties: {
    positional: 'foo',
    named: 'baz',
    styles: {
      foo: '--foo',
      bar: '--bar',
      baz: '--baz',
      qux: '--qux'
    }
  }
});

testTransformation('appending a class attribute with dynamic local-class value', {
  statementInput: 'class="x" local-class=(helper positional "bar" keyA=named keyB="qux")',
  statementOutput: 'class=(concat "x " (lookup-module-styles (unbound styles) (helper positional "bar" keyA=named keyB="qux")))',
  elementInput: 'class="x" local-class={{helper positional "bar" keyA=named keyB="qux"}}',
  elementOutput: 'class="x {{lookup-module-styles (unbound styles) (helper positional "bar" keyA=named keyB="qux")}}"',

  selector: '.x.--foo.--bar.--baz.--qux',
  properties: {
    positional: 'foo',
    named: 'baz',
    styles: {
      foo: '--foo',
      bar: '--bar',
      baz: '--baz',
      qux: '--qux'
    }
  }
});

testTransformation('appending a class attribute with mixed local-class value', {
  statementInput: 'class="x" local-class=(concat "foo " (helper positional "bar" keyA=named keyB="qux"))',
  statementOutput: 'class=(concat "x " (lookup-module-styles (unbound styles) (concat "foo " (helper positional "bar" keyA=named keyB="qux"))))',
  elementInput: 'class="x" local-class="foo {{helper positional "bar" keyA=named keyB="qux"}}"',
  elementOutput: 'class="x {{lookup-module-styles (unbound styles) (concat "foo " (helper positional "bar" keyA=named keyB="qux"))}}"',

  selector: '.x.--foo.--bar.--baz.--qux',
  properties: {
    positional: 'foo',
    named: 'baz',
    styles: {
      foo: '--foo',
      bar: '--bar',
      baz: '--baz',
      qux: '--qux'
    }
  }
});

testTransformation('appending a path class attribute', {
  statementInput: 'class=x local-class="foo"',
  statementOutput: 'class=(concat x " " (unbound styles.foo))',
  elementInput: 'class={{x}} local-class="foo"',
  elementOutput: 'class="{{x}} {{unbound styles.foo}}"',

  selector: '.--x.--foo',
  properties: {
    x: '--x',
    styles: {
      foo: '--foo'
    }
  }
});

testTransformation('appending a helper class attribute', {
  statementInput: 'class=(concat "x") local-class="foo"',
  statementOutput: 'class=(concat (concat "x") " " (unbound styles.foo))',
  elementInput: 'class={{concat "x"}} local-class="foo"',
  elementOutput: 'class="{{concat "x"}} {{unbound styles.foo}}"',

  selector: '.x.--foo',
  properties: {
    styles: {
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
  test(title, function(assert) {
    const assertTransforms = (template, type, input, output) => {
      const inputString = template.replace('[ATTRS]', input);
      const outputString = template.replace('[ATTRS]', output);

      this.render(compile(outputString));
      assert.ok(this.$(selector).length, 'Expected output contains verification selector');
      const expected = this.$().html().replace(/id="\w+"/g, '');

      this.render(compile(inputString, { plugins: { ast: [ClassTransformPlugin] } }));
      assert.ok(this.$(selector).length, 'Actual output contains verification selector');
      const actual = this.$().html().replace(/id="\w+"/g, '');

      assert.equal(actual, expected, `Works for ${type}`);
    };

    this.setProperties(properties);

    if (elementOutput) {
      assertTransforms('<div [ATTRS]></div>', 'ElementNode', elementInput, elementOutput);
    }

    if (statementOutput) {
      assertTransforms('{{x-div [ATTRS]}}', 'MustacheStatement', statementInput, statementOutput);
      assertTransforms('{{#x-div [ATTRS]}}{{/x-div}}', 'BlockStatement', statementInput, statementOutput);
    }
  });
}
