'use strict';

const utils = require('./utils');
const semver = require('semver');

module.exports = class ClassTransformPlugin {
  constructor(options) {
    this.syntax = options.syntax;
    this.builders = options.syntax.builders;
    this.stylesModule = this.determineStylesModule(options.meta);
    this.isGlimmer = this.detectGlimmer();
    this.visitor = this.buildVisitor();

    // Alias for 2.15 <= Ember < 3.1
    this.visitors = this.visitor;
  }

  static forEmberVersion(version) {
    if (semver.lt(version, '2.15.0-alpha')) {
      return LegacyAdapter.bind(null, this);
    } else {
      return options => new this(options);
    }
  }

  determineStylesModule(meta) {
    if (!meta || !meta.moduleName) return;

    let name = meta.moduleName.replace(/\.\w+$/, '');
    if (name.endsWith('template')) {
      return name.replace(/template$/, 'styles');
    } else if (name.includes('/templates/')) {
      return name.replace('/templates/', '/styles/');
    }
  }

  detectGlimmer() {
    if (!this.syntax.parse) { return false; }

    // HTMLBars builds ConcatStatements with StringLiterals + raw PathExpressions
    // Glimmer builds ConcatStatements with TextNodes + MustacheStatements
    let ast = this.syntax.parse('<div class="foo {{bar}}"></div>');
    return ast.body[0].attributes[0].value.parts[0].type === 'TextNode';
  }

  buildVisitor() {
    return {
      ElementNode: node => this.transformElementNode(node),
      MustacheStatement: node => this.transformStatement(node),
      BlockStatement: node => this.transformStatement(node),
      SubExpression: node => this.transformSubexpression(node)
    };
  }

  transformStatement(node) {
    if (node.path.original === 'local-class') {
      this.transformLocalClassHelperInvocation(node);
    } else {
      this.transformPossibleComponentInvocation(node);
    }
  }

  transformSubexpression(node) {
    if (node.path.original === 'local-class') {
      this.transformLocalClassHelperInvocation(node);
    }
  }

  // Transform {{local-class 'foo'}} into {{local-class 'foo' from='path/to/styles-module'}}
  transformLocalClassHelperInvocation(node) {
    if (utils.getPair(node, 'from')) { return; }

    node.hash.pairs.push(this.builders.pair('from', this.stylesModuleNode()));
  }

  transformPossibleComponentInvocation(node) {
    let localClassPair = utils.getPair(node, 'local-class');
    if (!localClassPair) { return; }

    utils.removePair(node, localClassPair);

    let classPair = utils.getPair(node, 'class');
    let params = [];
    let concatSexpr;

    if (classPair) {
      params.push(classPair.value);
      utils.removePair(node, classPair);
    }

    utils.pushAll(params, this.localToPath(localClassPair.value));
    this.divide(params, 'string');
    concatSexpr = this.builders.sexpr(this.builders.path('concat'), params);
    node.hash.pairs.push(this.builders.pair('class', concatSexpr));
  }

  transformElementNode(node) {
    let localClassAttr = utils.getAttr(node, 'local-class');
    if (!localClassAttr) { return; }

    utils.removeAttr(node, localClassAttr);

    let stringBuilder = this.isGlimmer ? 'text' : 'string';
    let classAttr = utils.getAttr(node, 'class');
    let parts = [];
    let classAttrValue

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
  }

  localToPath(node) {
    if (~['SubExpression', 'MustacheStatement'].indexOf(node.type)) {
      return this.dynamicLocalPath(node);
    } else if (node.type === 'ConcatStatement') {
      return this.concatLocalPath(node);
    } else if (~['TextNode', 'StringLiteral'].indexOf(node.type)) {
      return this.staticLocalPath(node);
    } else {
      throw new TypeError('ember-css-modules - invalid type, ' + node.type + ', passed to local-class attribute.');
    }
  }

  dynamicLocalPath(node) {
    let localClassPath = this.builders.path('local-class');

    let builder;
    if (node.type === 'SubExpression') {
      builder = 'sexpr';
    } else if (node.type === 'MustacheStatement') {
      node = utils.mustacheToSexpr(this.builders, node);
      builder = 'mustache';
    }

    let hash = this.builders.hash([this.builders.pair('from', this.stylesModuleNode())]);
    let localClassInvocation = this.builders[builder](localClassPath, [node], hash);

    return [localClassInvocation];
  }

  stylesModuleNode() {
    if (!this.stylesModule) {
      throw new Error('Unable to bind a local class in a template with an unknown moduleName');
    }

    return this.builders.string(this.stylesModule);
  }

  concatLocalPath(node) {
    let concatPath = this.builders.path('concat');
    let concatParts = utils.concatStatementToParams(this.builders, node, this.isGlimmer);
    let concatStatement = this.builders.mustache(concatPath, concatParts);
    return this.dynamicLocalPath(concatStatement);
  }

  staticLocalPath(node) {
    let locals = typeof node.chars === 'string' ? node.chars : node.value;
    let exprBuilder = typeof node.chars === 'string' ? 'mustache' : 'sexpr';

    return [this.builders[exprBuilder](
      'local-class',
      [this.builders.string(locals)],
      this.builders.hash([this.builders.pair('from', this.stylesModuleNode())])
    )];
  }

  divide(parts, builder) {
    for (let i = 0; i < parts.length - 1; i++) {
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
  }
}

// For Ember < 2.15
class LegacyAdapter {
  constructor(plugin, options) {
    this.plugin = plugin;
    this.meta = options.meta;
    this.syntax = null;
  }

  transform(ast) {
    let plugin = new this.plugin({ meta: this.meta, syntax: this.syntax });
    this.syntax.traverse(ast, plugin.visitor);
    return ast;
  }
}
