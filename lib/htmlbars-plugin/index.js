'use strict';

var utils = require('./utils');

function ClassTransformPlugin() {
  this.syntax = null;
  this.builders = null;
  this.isGlimmer = false;
}

ClassTransformPlugin.prototype.constructor = ClassTransformPlugin;

ClassTransformPlugin.prototype.transform = function(ast) {
  if (!this.builders) {
    this.builders = this.syntax.builders;
    this.isGlimmer = this.detectGlimmer();
  }

  var plugin = this;
  var walker = new this.syntax.Walker();

  walker.visit(ast, function(node) {
    switch(node.type) {
      case 'ElementNode':
        plugin.transformElementNode(node);
        break;
      case 'MustacheStatement':
      case 'BlockStatement':
        plugin.transformStatement(node);
        break;
    }
  });

  return ast;
};

ClassTransformPlugin.prototype.detectGlimmer = function(node) {
  if (!this.syntax.parse) { return false; }

  // HTMLBars builds ConcatStatements with StringLiterals + raw PathExpressions
  // Glimmer builds ConcatStatements with TextNodes + MustacheStatements
  var ast = this.syntax.parse('<div class="foo {{bar}}"></div>');
  return ast.body[0].attributes[0].value.parts[0].type === 'TextNode';
};

ClassTransformPlugin.prototype.transformStatement = function(node) {
  var localClassPair = utils.getPair(node, 'local-class');
  if (!localClassPair) { return; }

  utils.removePair(node, localClassPair);

  var classPair = utils.getPair(node, 'class');
  var params = [];
  var concatSexpr;

  if (classPair) {
    params.push(classPair.value);
    utils.removePair(node, classPair);
  }

  utils.pushAll(params, this.localToPath(localClassPair.value));
  this.divide(params, 'string');
  concatSexpr = this.builders.sexpr(this.builders.path('concat'), params);
  node.hash.pairs.push(this.builders.pair('class', concatSexpr));
};

ClassTransformPlugin.prototype.transformElementNode = function(node) {
  var localClassAttr = utils.getAttr(node, 'local-class');
  if (!localClassAttr) { return; }

  utils.removeAttr(node, localClassAttr);

  var stringBuilder = this.isGlimmer ? 'text' : 'string';
  var classAttr = utils.getAttr(node, 'class');
  var parts = [];
  var classAttrValue

  if (classAttr) {
    utils.removeAttr(node, classAttr);
    classAttrValue = classAttr.value;

    // Unwrap the original class attribute value and transform
    // the attr value into parts that make up the ConcatStatement
    // that is returned from this method
    if (classAttrValue.type === 'ConcatStatement') {
      parts.push(this.builders.mustache(this.builders.path('concat'), utils.concatStatementToParams(this.builders, classAttrValue, this.isGlimmer)));
    } else if (classAttrValue.type === 'TextNode') {
      parts.push(this.builders[stringBuilder](classAttrValue.chars));
    } else if (classAttrValue.type === 'MustacheStatement') {
      if (classAttrValue.params.length || this.isGlimmer) {
        parts.push(classAttrValue);
      } else {
        parts.push(this.builders.path(classAttrValue.path.original));
      }
    }
  }

  utils.pushAll(parts, this.localToPath(localClassAttr.value));
  this.divide(parts, this.isGlimmer ? 'text' : 'string');
  node.attributes.push(this.builders.attr('class', this.builders.concat(parts)));
};

ClassTransformPlugin.prototype.localToPath = function(node) {
  if (~['SubExpression', 'MustacheStatement'].indexOf(node.type)) {
    return this.dynamicLocalPath(node);
  } else if (node.type === 'ConcatStatement') {
    return this.concatLocalPath(node);
  } else if (~['TextNode', 'StringLiteral'].indexOf(node.type)) {
    return this.staticLocalPath(node);
  } else {
    throw new TypeError('ember-css-modules - invalid type, ' + node.type + ', passed to local-class attribute.');
  }
};

ClassTransformPlugin.prototype.dynamicLocalPath = function(node) {
  var lookupModuleStylesPath = this.builders.path('lookup-module-styles');
  var stylePath = this.builders.path('styles');

  var builder;
  if (node.type === 'SubExpression') {
    builder = 'sexpr';
  } else if (node.type === 'MustacheStatement') {
    node = utils.mustacheToSexpr(this.builders, node);
    builder = 'mustache';
  }

  var stylesSexpr = this.builders.sexpr(this.builders.path('unbound'), [stylePath]);
  var lookupModuleStyles = this.builders[builder](lookupModuleStylesPath, [stylesSexpr, node]);

  return [lookupModuleStyles];
};

ClassTransformPlugin.prototype.concatLocalPath = function(node) {
  var concatPath = this.builders.path('concat');
  var concatParts = utils.concatStatementToParams(this.builders, node, this.isGlimmer);
  var concatStatement = this.builders.mustache(concatPath, concatParts);
  return this.dynamicLocalPath(concatStatement);
};

ClassTransformPlugin.prototype.staticLocalPath = function(node) {
  var locals = typeof node.chars === 'string' ? node.chars : node.value;
  var builder = typeof node.chars === 'string' ? 'mustache' : 'sexpr';
  var classes = locals.split(' ');

  return classes.filter(function(local) {
    return local.trim().length > 0;
  }).map(function(local) {
    var unboundPath = this.builders.path('unbound');
    var stylePath = this.builders.path('styles.' + local.trim());
    return this.builders[builder](unboundPath, [stylePath]);
  }, this);
};

ClassTransformPlugin.prototype.divide = function(parts, builder) {
  for (var i = 0; i < parts.length - 1; i++) {
    if (~['StringLiteral', 'TextNode'].indexOf(parts[i].type)) {
      utils.updateStringValue(parts[i], function(str) { return str + ' '; });
    } else if (~['StringLiteral', 'TextNode'].indexOf(parts[i + 1].type)) {
      utils.updateStringValue(parts[i + 1], function(str) { return ' ' + str; });
    } else {
      parts.splice(i + 1, 0, this.builders[builder](' '));
      i++
    }
  }

  return parts;
};

module.exports = ClassTransformPlugin;
