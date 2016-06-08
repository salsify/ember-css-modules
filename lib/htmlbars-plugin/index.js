'use strict';

var utils = require('./utils');

function Plugin() {
  this.syntax = null
}

Plugin.prototype.constructor = Plugin;

Plugin.prototype.transform = function(ast) {
  var plugin = this;
  var walker = new this.syntax.Walker();

  walker.visit(ast, function(node) {
    if (plugin.validate(node)) {
      switch(node.type) {
        case 'ElementNode':
          plugin.parseElementNode(node);
          break;
        case 'MustacheStatement':
          plugin.parseMustacheStatement(node);
          break;
        case 'BlockStatement':
          plugin.parseBlockStatement(node);
          break;
      }
    }
  });

  return ast;
};

Plugin.prototype.parseMustacheStatement = function(node) {
  var localClassPair = utils.pair(node, 'local-class');
  if (!localClassPair) { return; }
  utils.removePair(node, localClassPair);

  var classPair = utils.pair(node, 'class');
  var params = [];

  if (classPair) {
    params.push(classPair.value);
    params.push(utils.seperator());
    utils.removePair(node, classPair);
  }

  classPair = {
    type: 'HashPair',
    key: 'class',
    value: {
      params: params,
      type: 'SubExpression',
      path: {
        type: 'PathExpresison',
        original: 'concat',
        parts: ['concat']
      },
      hash: {
        type: 'Hash',
        pairs: []
      }
    }
  };

  node.hash.pairs.push(classPair);

  this.localClassesToPathExpressions(localClassPair.value.value).forEach(function(exp) {
    params.push(exp);
    params.push(utils.seperator());
  });
};

Plugin.prototype.parseBlockStatement = function(node) {
  throw new Error('not implemented.');
};

Plugin.prototype.parseElementNode = function(node) {
  var localClassAttr = utils.attr(node, 'local-class');
  if (!localClassAttr) { return; }
  utils.removeAttr(node, localClassAttr);

  var classAttrNode = utils.attr(node, 'class');

  if (!classAttrNode || (classAttrNode && classAttrNode.value.type !== 'ConcatStatement')) {
    var parts = [];

    if (classAttrNode) {
      parts.push(this.transformClassAttr(classAttrNode));
      parts.push(utils.seperator());
      utils.removeAttr(node, classAttrNode);
    }

    classAttrNode = {
      type: 'AttrNode',
      name: 'class',
      value: {
        type: 'ConcatStatement',
        parts: parts
      }
    };

    node.attributes.push(classAttrNode);
  }

  var classAttrParts = classAttrNode.value.parts;

  this.localClassesToPathExpressions(localClassAttr.value.chars).forEach(function(exp) {
    classAttrParts.push(exp);
    classAttrParts.push(utils.seperator());
  });
};

Plugin.prototype.transformClassAttr = function(classAttrNode) {
  var value = classAttrNode.value;

  switch (value.type) {
    case 'TextNode':
      return {
        type: 'StringLiteral',
        value: value.chars,
        original: value.chars,
        loc: null
      };
    case 'MustacheStatement':
      delete value.path.loc;
      return value.path;
  }
};

Plugin.prototype.localClassesToPathExpressions = function(classNames) {
  return classNames.split(' ').map(function(className) {
    var normalizedClassName = className.trim();

    return {
      type: 'PathExpression',
      original: 'styles.' + normalizedClassName,
      parts: ['styles', normalizedClassName]
    };
  });
}

Plugin.prototype.validate = function(node) {
  var type = node.type;

  // BlockStatement: {{#foo-bar}}{{/foo-bar}}
  // MustacheStatement: {{foo-bar}}
  // ElementNode: <button></button>
  return ['ElementNode', 'MustacheStatement'/*, 'BlockStatement'*/].indexOf(type) > -1;
};

module.exports = Plugin;
