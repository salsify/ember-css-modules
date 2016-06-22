var test = require('tape');
var htmlbars = require('htmlbars/dist/cjs/htmlbars-syntax');
var ClassTransformPlugin = require('../lib/htmlbars-plugin');

testTransformation('creating a class attribute', {
  input: 'local-class="foo"',
  statementOutput: 'class=(concat styles.foo)', // FIXME superfluous concat
  elementOutput: 'class="{{styles.foo}}"'
});

testTransformation('appending to a class attribute', {
  input: 'class="x" local-class="foo"',
  statementOutput: 'class=(concat "x" " " styles.foo)',
  elementOutput: 'class="x {{styles.foo}}"'
});

// ...

function testTransformation(title, options) {
  test('ClassTransformPlugin: ' + title, function(assert) {
    assert.plan(3);
    assertTransforms('<div [ATTRS]></div>', 'ElementNode', options.input, options.elementOutput, assert);
    assertTransforms('{{x-div [ATTRS]}}', 'MustacheStatement', options.input, options.statementOutput, assert);
    assertTransforms('{{#x-div [ATTRS]}}content{{/x-div}}', 'BlockStatement', options.input, options.statementOutput, assert);
  });
}

function assertTransforms(template, type, input, output, assert) {
  var input = template.replace('[ATTRS]', input);
  var output = template.replace('[ATTRS]', output);
  var actual = htmlbars.print(htmlbars.parse(input, { plugins: { ast: [ClassTransformPlugin] } }));
  assert.equal(actual, output, 'works for ' + type);
}
