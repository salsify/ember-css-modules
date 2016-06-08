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
        plugin.parseElementNode(node);
        break;
      case 'MustacheStatement':
      case 'BlockStatement':
        plugin.parseStatement(node);
        break;
    }
  });

  return ast;
};

ClassTransformPlugin.prototype.parseStatement = function(node) {
  var localClassPair = utils.getPair(node, 'local-class');
  if (!localClassPair) { return; }

  utils.removePair(node, localClassPair);

  var classPair = utils.getPair(node, 'class');
  var params = [];

  if (classPair) {
    params.push(classPair.value);
    utils.removePair(node, classPair);
  }

  utils.pushAll(params, this.localToPath(localClassPair.value.value));
  this.seperator(params);
  var concatSexpr = this.builders.sexpr('concat', params);
  node.hash.pairs.push(this.builders.pair('class', concatSexpr));
};

ClassTransformPlugin.prototype.parseElementNode = function(node) {
  var localClassAttr = utils.getAttr(node, 'local-class');
  if (!localClassAttr) { return; }

  utils.removeAttr(node, localClassAttr);

  var classAttr = utils.getAttr(node, 'class');
  var parts = [];

  if (classAttr) {
    utils.removeAttr(node, classAttr);

    var classAttrValue = classAttr.value;

    // Unwrap the original class attribute value
    if (classAttrValue.type === 'ConcatStatement') {
      parts = parts.concat(classAttrValue.parts);
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

  utils.pushAll(parts, this.localToPath(localClassAttr.value.chars));
  this.seperator(parts);
  node.attributes.push(this.builders.attr('class', this.builders.concat(parts)));
};

ClassTransformPlugin.prototype.localToPath = function(locals) {
  return locals.split(' ').map(function(local) {
    return this.builders.path('styles.' + local.trim());
  }, this);
};

ClassTransformPlugin.prototype.seperator = function(parts) {
  for (var i=0;i<parts.length;i++) {
    if (i % 2 === 1) {
      parts.splice(i, 0, this.builders.string(' '));
    }
  }

  return parts;
};

module.exports = ClassTransformPlugin;
