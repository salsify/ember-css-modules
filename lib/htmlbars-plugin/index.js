'use strict';

var utils = require('./utils');

function Plugin() {
  this.syntax = null;
  this.builders = null;
}

Plugin.prototype.constructor = Plugin;

Plugin.prototype.transform = function(ast) {
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

Plugin.prototype.parseStatement = function(node) {
  var localClassPair = utils.getPair(node, 'local-class');

  if (!localClassPair) { return; }

  utils.removePair(node, localClassPair);

  var classPair = utils.getPair(node, 'class');
  var params = [];

  if (classPair) {
    params.push(classPair.value);
    params.push(this.seperator());
    utils.removePair(node, classPair);
  }

  var concatSexpr = this.builders.sexpr('concat', params);
  node.hash.pairs.push(this.builders.pair('class', concatSexpr));
  this.setLocalClasses(params, localClassPair.value.value);
};

Plugin.prototype.parseElementNode = function(node) {
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

    if (parts.length) {
      parts.push(this.seperator());
    }
  }

  this.setLocalClasses(parts, localClassAttr.value.chars);
  var classAttrReplacement = this.builders.attr('class', this.builders.concat(parts));
  node.attributes.push(classAttrReplacement);
};

Plugin.prototype.setLocalClasses = function(target, classNames) {
  classNames.split(' ').forEach(function(className) {
    target.push(this.builders.path('styles.' + className.trim()));
    target.push(this.seperator());
  }, this);
};

Plugin.prototype.seperator = function() {
  return this.builders.string(' ');
};

module.exports = Plugin;
