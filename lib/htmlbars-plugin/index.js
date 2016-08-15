'use strict';

var utils = require('./utils');
var htmlbars = require('htmlbars/dist/cjs/htmlbars-syntax');


function ClassTransformPlugin() {
  this.syntax = null;
  this.builders = null;
}

ClassTransformPlugin.prototype.constructor = ClassTransformPlugin;

ClassTransformPlugin.prototype.transform = function(ast) {
  if (!this.builders) {
    this.builders = this.syntax.builders;
  }

  this.getPath = this.builders.path('lookup-module-styles');
  this.unboundPath = this.builders.path('unbound');
  this.stylePath = this.builders.path('styles');

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

ClassTransformPlugin.prototype.transformStatement = function(node) {
  var localClassPair = utils.getPair(node, 'local-class');
  if (!localClassPair) { return; }
  if (!~['StringLiteral', 'TextNode', 'SubExpression', 'MustacheStatement'].indexOf(localClassPair.value.type)) {
    throw new TypeError('ember-css-modules - invalid type, ' + localClassPair.value.type + ', passed to local-class attribute.');
  }

  utils.removePair(node, localClassPair);

  var classPair = utils.getPair(node, 'class');
  var classPart;

  if (classPair) {
    if (classPair.value.type === 'PathExpression') {
      classPart = this.builders.string(classPair.value.original);
    } else {
      classPart = classPair.value;
    }

    utils.removePair(node, classPair);
  } else {
    classPart = this.builders.null();
  }

  var localClassPart;
  if (~['SubExpression', 'MustacheStatement'].indexOf(localClassPair.value.type)) {
    localClassPart = localClassPair.value;
  } else {
    localClassPart = this.builders['string'](this.trimWhitespace(localClassPair.value.value));
  }

  var unboundPart = this.builders['sexpr'](this.unboundPath, [this.stylePath]);
  var finalPart = this.builders['sexpr'](this.getPath, [classPart, unboundPart, localClassPart]);
  node.hash.pairs.push(this.builders.attr('class', finalPart));
};

ClassTransformPlugin.prototype.transformElementNode = function(node) {
  var localClassAttr = utils.getAttr(node, 'local-class');
  if (!localClassAttr) { return; }
  if (!~['StringLiteral', 'TextNode', 'SubExpression', 'MustacheStatement'].indexOf(localClassAttr.value.type)) {
    throw new TypeError('ember-css-modules - invalid type, ' + localClassAttr.value.type + ', passed to local-class attribute.');
  }

  utils.removeAttr(node, localClassAttr);

  var classAttr = utils.getAttr(node, 'class');
  var classAttrValue;
  var classPart;

  if (classAttr) {
    utils.removeAttr(node, classAttr);
    classAttrValue = classAttr.value;

    // Unwrap the original class attribute value and transform
    // the attr value into parts that make up the ConcatStatement
    // that is returned from this method
    if (classAttrValue.type === 'ConcatStatement') {
      classPart = this.builders.sexpr('concat', classAttrValue.parts);
    } else if (classAttrValue.type === 'TextNode') {
      classPart = this.builders.string(classAttrValue.chars);
    } else if (classAttrValue.type === 'MustacheStatement') {
      if (classAttrValue.params.length) {
        classPart = classAttrValue;
      } else {
        classPart = this.builders.path(classAttrValue.path.original);
      }
    }
  } else {
    classPart = this.builders.null();
  }

  var localClassPart;
  if (~['SubExpression', 'MustacheStatement'].indexOf(localClassAttr.value.type)) {
    localClassPart = localClassAttr.value;
  } else {
    localClassPart = this.builders['string'](this.trimWhitespace(localClassAttr.value.chars));
  }

  var unboundPart = this.builders['sexpr'](this.unboundPath, [this.stylePath]);
  var finalPart = this.builders['mustache'](this.getPath, [classPart, unboundPart, localClassPart]);

  node.attributes.push(this.builders.attr('class', finalPart));
};

ClassTransformPlugin.prototype.trimWhitespace = function(str) {
  return str.replace(/\s+/g,' ').trim() // " foo   bar " -> "foo bar"
};

module.exports = ClassTransformPlugin;
