var test = require('tape');
var htmlbars = require('htmlbars/dist/cjs/htmlbars-syntax');
var ClassTransformPlugin = require('../lib/htmlbars-plugin');

testTransformation('creating a class attribute', {
  input: 'local-class="foo"',
  statementOutput: 'class=(concat (unbound styles.foo))', // FIXME superfluous concat
  elementOutput: 'class="{{unbound styles.foo}}"'
});

testTransformation('creating a class attribute with multiple classes', {
  input: 'local-class="foo bar"',
  statementOutput: 'class=(concat (unbound styles.foo) " " (unbound styles.bar))',
  elementOutput: 'class="{{unbound styles.foo}} {{unbound styles.bar}}"'
});

testTransformation('appending to a class attribute', {
  input: 'class="x" local-class="foo"',
  statementOutput: 'class=(concat "x" " " (unbound styles.foo))',
  elementOutput: 'class="x {{unbound styles.foo}}"'
});

testTransformation('appending to a class attribute with multiple classes', {
  input: 'class="x" local-class="foo bar"',
  statementOutput: 'class=(concat "x" " " (unbound styles.foo) " " (unbound styles.bar))',
  elementOutput: 'class="x {{unbound styles.foo}} {{unbound styles.bar}}"'
});

testTransformation('appending to an unquoted class attribute', {
  input: 'class=x local-class="foo"',
  statementOutput: 'class=(concat x " " (unbound styles.foo))',
  elementOutput: 'class="x {{unbound styles.foo}}"'
});

testTransformation('appending to an unquoted class attribute with multiple classes', {
  input: 'class=x local-class="foo bar"',
  statementOutput: 'class=(concat x " " (unbound styles.foo) " " (unbound styles.bar))',
  elementOutput: 'class="x {{unbound styles.foo}} {{unbound styles.bar}}"'
});

testTransformation('creating a class attribute with dynamic local-class value', {
  statementInput: 'local-class=(if true foo)',
  statementOutput: 'class=(concat (lookup-module-styles (unbound styles) (if true foo)))',
  elementInput: 'local-class={{if true foo}}',
  elementOutput: 'class="{{lookup-module-styles (unbound styles) (if true foo)}}"'
});

testTransformation('creating a class attribute with mixed local-class value', {
  statementInput: 'local-class=(concat "foo " (if true bar))',
  statementOutput: 'class=(concat (lookup-module-styles (unbound styles) (concat "foo " (if true bar))))',
  elementInput: 'local-class="foo {{if true bar}}"',
  elementOutput: 'class="{{lookup-module-styles (unbound styles) (concat "foo " (if true bar))}}"'
});

testTransformation('appending a class attribute with dynamic local-class value', {
  statementInput: 'class="x" local-class=(if true foo)',
  statementOutput: 'class=(concat "x" " " (lookup-module-styles (unbound styles) (if true foo)))',
  elementInput: 'class="x" local-class={{if true foo}}',
  elementOutput: 'class="x {{lookup-module-styles (unbound styles) (if true foo)}}"'
});

testTransformation('appending a class attribute with mixed local-class value', {
  statementInput: 'class="qux" local-class=(concat "foo " (if true bar))',
  statementOutput: 'class=(concat "qux" " " (lookup-module-styles (unbound styles) (concat "foo " (if true bar))))',
  elementInput: 'class="qux" local-class="foo {{if true bar}}"',
  elementOutput: 'class="qux {{lookup-module-styles (unbound styles) (concat "foo " (if true bar))}}"'
});

function testTransformation(title, options) {
  test('ClassTransformPlugin: ' + title, function(assert) {
    assert.plan(3);
    assertTransforms('<div [ATTRS]></div>', 'ElementNode', options.elementInput || options.input, options.elementOutput, assert);
    assertTransforms('{{x-div [ATTRS]}}', 'MustacheStatement', options.statementInput || options.input, options.statementOutput, assert);
    assertTransforms('{{#x-div [ATTRS]}}content{{/x-div}}', 'BlockStatement', options.statementInput || options.input, options.statementOutput, assert);
  });
}

function assertTransforms(template, type, input, output, assert) {
  var input = template.replace('[ATTRS]', input);
  var output = template.replace('[ATTRS]', output);

  var actual = htmlbars.print(htmlbars.parse(input, { plugins: { ast: [ClassTransformPlugin] } }));
  var expected = htmlbars.print(htmlbars.parse(output));

  assert.equal(actual, expected, 'works for ' + type);
}
