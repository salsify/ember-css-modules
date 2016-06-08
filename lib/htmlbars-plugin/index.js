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

Plugin.prototype.validate = function(node) {
  return ['ElementNode', 'MustacheStatement'/*, 'BlockStatement'*/].indexOf(node.type) > -1;
};

Plugin.prototype.parseBlockStatement = function(node) {
  throw new Error('not implemented.');
};

Plugin.prototype.parseMustacheStatement = function(node) {
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

  if (!classAttr || (classAttr && classAttr.value.type !== 'ConcatStatement')) {
    var parts = [];

    if (classAttr) {
      parts.push(this.transformClassAttr(classAttr));
      parts.push(this.seperator());
      utils.removeAttr(node, classAttr);
    }

    classAttr = this.builders.attr('class', this.builders.concat(parts));
    node.attributes.push(classAttr);
  }

  var classAttrParts = classAttr.value.parts;
  classAttrParts.push(this.seperator());
  this.setLocalClasses(classAttrParts, localClassAttr.value.chars);
};

Plugin.prototype.transformClassAttr = function(classAttr) {
  var value = classAttr.value;

  switch (value.type) {
    case 'TextNode':
      return this.builders.string(value.chars);
    case 'MustacheStatement':
      delete value.path.loc;
      return value.path;
  }
};

Plugin.prototype.setLocalClasses = function(target, classNames) {
  classNames.split(' ').forEach(function(className) {
    target.push(this.builders.path('styles.' + className.trim()));
  }, this);
};

Plugin.prototype.seperator = function() {
  return this.builders.string(' ');
};

module.exports = Plugin;
