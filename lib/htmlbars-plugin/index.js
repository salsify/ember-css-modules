'use strict';

var utils = require('./utils');

function ClassTransformPlugin() {
  this.syntax = null;
  this.builders = null;
}

ClassTransformPlugin.prototype.constructor = ClassTransformPlugin;

ClassTransformPlugin.prototype.transform = function(ast) {
  if (!this.builders) {
    this.builders = this.syntax.builders;
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
  this.divide(params);
  concatSexpr = this.builders.sexpr('concat', params);
  node.hash.pairs.push(this.builders.pair('class', concatSexpr));
};

ClassTransformPlugin.prototype.transformElementNode = function(node) {
  var localClassAttr = utils.getAttr(node, 'local-class');
  if (!localClassAttr) { return; }

  utils.removeAttr(node, localClassAttr);

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
      parts.push(this.builders.sexpr('concat', classAttrValue.parts));
    } else if (classAttrValue.type === 'TextNode') {
      parts.push(this.builders.string(classAttrValue.chars));
    } else if (classAttrValue.type === 'MustacheStatement') {
      if (classAttrValue.params.length) {
        parts.push(classAttrValue);
      } else {
        parts.push(this.builders.path(classAttrValue.path.original));
      }
    }
  }

  utils.pushAll(parts, this.localToPath(localClassAttr.value));
  this.divide(parts);
  node.attributes.push(this.builders.attr('class', this.builders.concat(parts)));
};

ClassTransformPlugin.prototype.localToPath = function(node) {
  if (!~['StringLiteral', 'TextNode'].indexOf(node.type)) {
    throw new TypeError('ember-css-modules - invalid type, ' + node.type + ', passed to local-class attribute.');
  }

  var locals = typeof node.chars === 'string' ? node.chars : node.value;
  var classes = locals.split(' ');

  return classes.filter(function(local) {
    return local.trim().length > 0;
  }).map(function(local) {
    return this.builders.path('styles.' + local.trim());
  }, this);
};

ClassTransformPlugin.prototype.divide = function(parts) {
  for (var i=0;i<parts.length;i++) {
    if (i % 2 === 1) {
      parts.splice(i, 0, this.builders.string(' '));
    }
  }

  return parts;
};

module.exports = ClassTransformPlugin;
