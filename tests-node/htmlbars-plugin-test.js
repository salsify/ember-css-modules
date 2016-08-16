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

testTransformationElement('creating a class attribute with dynamic value on element', {
  input: 'local-class={{if true foo}}',
  elementOutput: 'class="{{lookup-module-styles (unbound styles) {{if true foo}}}}"'
});

testTransformationStatement('creating a class attribute with dynamic value on statement', {
  input: 'local-class=(if true foo)',
  statementOutput: 'class=(concat (lookup-module-styles (unbound styles) (if true foo)))',
});

testTransformationElement('appending a class attribute with dynamic value on element', {
  input: 'class="x" local-class={{if true foo}}',
  elementOutput: 'class="x {{lookup-module-styles (unbound styles) {{if true foo}}}}"'
});

testTransformationStatement('appending a class attribute with dynamic value on statement', {
  input: 'class="x" local-class=(if true foo)',
  statementOutput: 'class=(concat "x" " " (lookup-module-styles (unbound styles) (if true foo)))'
});

function testTransformation(title, options) {
  test('ClassTransformPlugin: ' + title, function(assert) {
    assert.plan(3);
    assertElementTransforms('<div [ATTRS]></div>', 'ElementNode', options.input, options.elementOutput, assert);
    assertStatementTransforms('{{x-div [ATTRS]}}', 'MustacheStatement', options.input, options.statementOutput, assert);
    assertStatementTransforms('{{#x-div [ATTRS]}}content{{/x-div}}', 'BlockStatement', options.input, options.statementOutput, assert);
  });
}

function testTransformationElement(title, options) {
  test('ClassTransformPlugin: ' + title, function(assert) {
    assert.plan(1);
    assertElementTransforms('<div [ATTRS]></div>', 'ElementNode', options.input, options.elementOutput, assert);
  });
}

function testTransformationStatement(title, options) {
  test('ClassTransformPlugin: ' + title, function(assert) {
    assert.plan(2);
    assertStatementTransforms('{{x-div [ATTRS]}}', 'MustacheStatement', options.input, options.statementOutput, assert);
    assertStatementTransforms('{{#x-div [ATTRS]}}content{{/x-div}}', 'BlockStatement', options.input, options.statementOutput, assert);
  });
}

function assertElementTransforms(template, type, input, output, assert) {
  var input = template.replace('[ATTRS]', input);
  var output = template.replace('[ATTRS]', output);

  var actual = htmlbars.print(htmlbars.parse(input, { plugins: { ast: [ClassTransformPlugin] } }));
  assert.equal(actual, output, 'works for ' + type);
}

function assertStatementTransforms(template, type, input, output, assert) {
  var input = template.replace('[ATTRS]', input);
  var output = template.replace('[ATTRS]', output);

  var actual = htmlbars.print(htmlbars.parse(input, { plugins: { ast: [ClassTransformPlugin] } }));
  var expected = htmlbars.print(htmlbars.parse(output));
  assert.equal(actual, expected, 'works for ' + type);
}
