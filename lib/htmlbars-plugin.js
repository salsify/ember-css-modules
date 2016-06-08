/**
 *
 * <button class="btn btn-sm" local-class="foo bar"></button>
 * gets preprocessed to <button class="btn btn-sm {{styles.foo}} {{styles.bar}}">
 *
 */
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
  var localClass = findPair(node, 'local-class');
  if (!localClass) { return; }

  var classPair = findPair(node, 'class');

  if (!classPair) {
    node.hash.pairs({
      type: 'HashPair',
      key: 'class',
      value: {
        type: 'SubExpression',
        path: {},
        params: {},
        hash: {}
      }
    });
  }

  // TODO: finish
};

Plugin.prototype.parseBlockStatement = function(node) {
  throw new Error('not implemented.');
};

Plugin.prototype.parseElementNode = function(node) {
  var localClassAttr = elementAttr(node, 'local-class');

  if (!localClassAttr) { return; }

  var classAttrNode = elementAttr(node, 'class');

  if (!classAttrNode || (classAttrNode && classAttrNode.value.type !== 'ConcatStatement')) {
    var parts = [];

    if (classAttrNode) {
      parts.push(this.transformClassAttr(classAttrNode));
      removeAttr(node, classAttrNode);
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

  if (classAttrParts.length) {
    classAttrParts.push(seperator());
  }

  localClassAttr.value.chars.split(' ').forEach(function(className) {
    var normalizedClassName = className.trim();

    classAttrParts.push({
      type: 'PathExpression',
      original: 'styles.' + normalizedClassName,
      parts: ['styles', normalizedClassName]
    });

    classAttrParts.push(seperator());
  });

  removeAttr(node, localClassAttr);
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

Plugin.prototype.validate = function(node) {
  var type = node.type;

  // BlockStatement: {{#foo-bar}}{{/foo-bar}}
  // MustacheStatement: {{foo-bar}}
  // ElementNode: <button></button>
  return ['ElementNode', 'MustacheStatement'/*, 'BlockStatement'*/].indexOf(type) > -1;
};

function removeAttr(node, attribute) {
  node.attributes.splice(node.attributes.indexOf(attribute), 1);
}

function seperator() {
  return {
    type: 'StringLiteral',
    value: ' ',
    original: ' '
  }
}

function pushAll(target, source) {
  for (var i=0;i<source.length;i++) {
    target.push(source[i]);
  }
}

function elementAttr(node, path) {
  return findBy(node.attributes, 'name', path);
}

function findPair(node, path) {
  return findBy(node.hash.pairs, 'key', path);
}

function findBy(target, key, path) {
  for (var i = 0, l = target.length; i < l; i++) {
    if (target[i][key] === path) {
      return target[i];
    }
  }

  return false;
}

module.exports = Plugin;
