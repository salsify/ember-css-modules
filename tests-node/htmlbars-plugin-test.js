var test = require('tape');
var htmlbars = require('htmlbars/dist/cjs/htmlbars-syntax');
var ClassTransformPlugin = require('../lib/htmlbars-plugin');


testTransformation('creating a class attribute', {
  input: 'class="foo"',
  statementOutput: 'class="foo"',
  elementOutput: 'class="foo"'
});

testTransformation('creating a local-class attribute', {
  input: 'local-class="foo"',
  statementOutput: 'class=(lookup-module-styles null (unbound styles) "foo")',
  elementOutput: 'class={{lookup-module-styles null (unbound styles) "foo"}}'
});

testTransformation('creating a class attribute with multiple classes', {
  input: 'local-class="foo bar"',
  statementOutput: 'class=(lookup-module-styles null (unbound styles) "foo bar")',
  elementOutput: 'class={{lookup-module-styles null (unbound styles) "foo bar"}}'
});

testTransformationElement('creating a class attribute with dynamic value', {
  input: 'local-class={{if true foo}}',
  statementOutput: 'class=(lookup-module-styles null (unbound styles) (if true foo))',
  elementOutput: 'class={{lookup-module-styles null (unbound styles) {{if true foo}}}}'
});

testTransformation('appending to a class attribute', {
  input: 'class="x" local-class="foo"',
  statementOutput: 'class=(lookup-module-styles "x" (unbound styles) "foo")',
  elementOutput: 'class={{lookup-module-styles "x" (unbound styles) "foo"}}'
});

testTransformation('appending to a class attribute with multiple classes', {
  input: 'class="x" local-class="foo bar"',
  statementOutput: 'class=(lookup-module-styles "x" (unbound styles) "foo bar")',
  elementOutput: 'class={{lookup-module-styles "x" (unbound styles) "foo bar"}}'
});

testTransformation('appending to an unquoted class attribute', {
  input: 'class=x local-class="foo"',
  statementOutput: 'class=(lookup-module-styles "x" (unbound styles) "foo")',
  elementOutput: 'class={{lookup-module-styles "x" (unbound styles) "foo"}}'
});

testTransformation('appending to an unquoted class attribute with multiple classes', {
  input: 'class=x local-class="foo bar"',
  statementOutput: 'class=(lookup-module-styles "x" (unbound styles) "foo bar")',
  elementOutput: 'class={{lookup-module-styles "x" (unbound styles) "foo bar"}}'
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
