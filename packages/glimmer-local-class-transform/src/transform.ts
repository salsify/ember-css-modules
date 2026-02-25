import { dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { JSUtils } from 'babel-plugin-ember-template-compilation';
import type {
  AST,
  WalkerPath,
  NodeVisitor,
  ASTPluginBuilder,
  ASTPluginEnvironment,
  ASTPlugin,
} from '@glimmer/syntax';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Env extends ASTPluginEnvironment {
  moduleName: string;
  meta: {
    jsutils: JSUtils;
  };
}

export interface LocalClassConfig {
  /**
   * A specifier from which any necessary runtime code will be imported.
   */
  runtimeModule?: string;

  /**
   * A mapping, where each key is a regular expression and each value is a
   * corresponding replacement string, of template module paths to their
   * styles module paths. The first matching pattern will be used, and if
   * no pattern matches, an error will be thrown.
   *
   * As an example, to map any `.gjs` or `.hbs` file to a `.css` file of
   * the same name in the same location, you could write:
   *
   * ```js
   * pathMapping: {
   *  '\\.(gjs|hbs)$': '.css',
   * },
   * ```
   *
   * Note that the replacement strings may use `$1`, `$2`, etc. to reference
   * capture groups from the regular expression.
   *
   * By default, any `.js`, `.ts`, `.gjs`, `.gts` or `.hbs` file will be
   * mapped to a `.module.css` file in the same location using the configuration
   * exported from this module as `defaultPathMapping`.
   */
  pathMapping?: { [sourceRegExp: string]: string };
}

export function localClassTransform(
  config: LocalClassConfig = {},
): ASTPluginBuilder<ASTPluginEnvironment> {
  return (env) => {
    if (!('moduleName' in env)) {
      throw new Error('Missing `moduleName` for template');
    }

    if (!env.meta || !('jsutils' in env.meta)) {
      throw new Error('Outdated version of `ember-cli-htmlbars` or Embroider');
    }

    return new LocalClassTransform(env as Env, config);
  };
}

/**
 * For use directly with template processors. For example, with
 * `babel-plugin-ember-template-compilation` you might set up your
 * Babel plugin config like this:
 *
 * ```js
 * [
 *   // ... other plugins
 *   [
 *     'babel-plugin-ember-template-compilation',
 *     {
 *       targetFormat: 'hbs', // or 'wire', depending on whether this is an addon or app
 *       transforms: [
 *         ['glimmer-local-class-transform', { config: 'can go here' }],
 *         // ... other transforms
 *       ],
 *     },
 *   ],
 *   // ... other plugins
 * ]
 * ```
 *
 * See [the `babel-plugin-ember-template-compilation` README][bpetc-readme] for
 * further details.
 *
 * [bpetc-readme]: https://github.com/emberjs/babel-plugin-ember-template-compilation)
 */
export default function localClassTransformPlugin(
  config: LocalClassConfig,
): ASTPluginBuilder<ASTPluginEnvironment>;
export default function localClassTransformPlugin(env: Env): ASTPlugin;
export default function localClassTransformPlugin(configOrEnv: LocalClassConfig | Env) {
  if (typeof configOrEnv === 'object' && 'moduleName' in configOrEnv) {
    return localClassTransform({})(configOrEnv);
  } else {
    return localClassTransform(configOrEnv);
  }
}

/**
 * For use in Ember CLI builds, either v1 addons or applications using the
 * classic pipeline or `@embroider/compat`.
 *
 * ```js
 * registry.add(
 *   'htmlbars-ast-plugin',
 *   localClassRegistryPlugin({
 *     // config here
 *   })
 * );
 * ```
 *
 * Due to the timing of how the classic pipeline is initialized, it's not
 * possible to add a template transform to the registry after the
 * `new EmberApp` constructor has returned, so users can't just directly add
 * the transform to the registry in their `ember-cli-build.js`.
 *
 * Working around this limitation is the sole purpose of the `ember-local-class`
 * package.
 */
export function localClassRegistryPlugin(config: LocalClassConfig = {}) {
  return {
    name: 'glimmer-local-class-transform',
    plugin: localClassTransform(config),
    baseDir: () => __dirname,
    parallelBabel: {
      requireFile: __filename,
      buildUsing: 'localClassRegistryPlugin',
      params: config,
    },
  };
}

/** The default value for `pathMapping` in the transform configuration. */
export const defaultPathMapping = Object.freeze({
  '(\\.g?[tj]s|\\.hbs)+$': '.module.css',
});

class LocalClassTransform {
  #env: Env;
  #config: LocalClassConfig;
  #stylesImportPath: string | undefined;

  public name = 'glimmer-local-class-transform';
  public visitor: NodeVisitor = {
    ElementNode: (node, walkerPath) => this.#visitElementNode(node, walkerPath),
    MustacheStatement: (node, walkerPath) => this.#visitCallNode(node, walkerPath),
    BlockStatement: (node, walkerPath) => this.#visitCallNode(node, walkerPath),
    SubExpression: (node, walkerPath) => this.#visitCallNode(node, walkerPath),
  };

  constructor(env: Env, config: LocalClassConfig) {
    this.#env = env;
    this.#config = config;
  }

  #visitElementNode(node: AST.ElementNode, walkerPath: WalkerPath<AST.ElementNode>) {
    let localClassAttr = node.attributes.find((attr) => attr.name === 'local-class');
    if (localClassAttr) {
      this.#transformLocalClassAttr(node, localClassAttr, walkerPath);
    }
  }

  #visitCallNode(node: AST.CallNode, walkerPath: WalkerPath<AST.CallNode>) {
    let localClassPair = node.hash.pairs.find((pair) => pair.key === 'local-class');
    if (localClassPair) {
      this.#transformLocalClassArg(node, localClassPair, walkerPath);
    } else if (node.path.type === 'PathExpression' && node.path.original === 'local-class') {
      this.#transformLocalClassInvocation(node, walkerPath);
    }
  }

  #transformLocalClassAttr(
    node: AST.ElementNode,
    localClassAttr: AST.AttrNode,
    walkerPath: WalkerPath<AST.ElementNode>,
  ): void {
    node.attributes.splice(node.attributes.indexOf(localClassAttr), 1);

    let { mustache, attr, text, concat } = this.#env.syntax.builders;
    let localClassExpression = this.#attrValueToExpression(localClassAttr, walkerPath);
    let localClassMustache = mustache('local-class', [localClassExpression]);

    let classAttr = node.attributes.find((attr) => attr.name === 'class');
    if (!classAttr) {
      // If no `class` attribute already exists, we need to create one and assign it
      // a fake good-enough `loc` whose content will start with `class=` to avoid
      // triggering https://github.com/emberjs/ember.js/issues/19392
      let loc = localClassAttr.loc.slice({ skipStart: 'local-'.length });
      node.attributes.push(attr('class', localClassMustache, loc));
    } else if (classAttr.value.type === 'ConcatStatement') {
      classAttr.value.parts.push(text(' '), localClassMustache);
    } else {
      classAttr.value = concat([classAttr.value, text(' '), localClassMustache]);
    }
  }

  #attrValueToExpression(
    { value }: AST.AttrNode,
    walkerPath: WalkerPath<AST.ElementNode>,
  ): AST.Expression {
    let { string, sexpr } = this.#env.syntax.builders;
    let parts = value.type === 'ConcatStatement' ? value.parts : [value];
    let expressions = parts.map((part) =>
      part.type === 'TextNode'
        ? string(part.chars)
        : part.params.length || part.hash.pairs.length
          ? sexpr(part.path, part.params, part.hash, part.loc)
          : part.path,
    );

    if (expressions.length === 1) {
      return expressions[0];
    } else {
      return sexpr(this.#runtimeHelper('join', walkerPath), expressions);
    }
  }

  #transformLocalClassArg(
    node: AST.CallNode,
    localClassPair: AST.HashPair,
    walkerPath: WalkerPath<AST.CallNode>,
  ): void {
    node.hash.pairs.splice(node.hash.pairs.indexOf(localClassPair), 1);

    let { sexpr, string, pair } = this.#env.syntax.builders;
    let classPair = node.hash.pairs.find((pair) => pair.key === 'class');
    let localClassSexpr = sexpr('local-class', [localClassPair.value]);
    if (classPair) {
      classPair.value = sexpr(this.#runtimeHelper('join', walkerPath), [
        classPair.value,
        string(' '),
        localClassSexpr,
      ]);
    } else {
      node.hash.pairs.push(pair('class', localClassSexpr));
    }
  }

  #transformLocalClassInvocation(node: AST.CallNode, walkerPath: WalkerPath<AST.CallNode>): void {
    let { path, hash } = this.#env.syntax.builders;
    let fromPair = node.hash.pairs.find((pair) => pair.key === 'from');
    let stylesPath = this.#getStylesImportPath(fromPair);

    node.path = path(this.#runtimeHelper('classNames', walkerPath));
    node.params = [path(this.#importStyles(stylesPath, walkerPath)), ...node.params];
    node.hash = hash();
  }

  #getStylesImportPath(fromPair: AST.HashPair | undefined): string {
    if (fromPair?.value.type === 'StringLiteral') {
      return fromPair.value.value;
    } else if (fromPair) {
      throw new Error('local-class `from` argument must be a string literal');
    }

    if (this.#stylesImportPath) {
      return this.#stylesImportPath;
    }

    let pathMapping = this.#config.pathMapping ?? defaultPathMapping;
    let { moduleName } = this.#env;
    for (let [pattern, replacement] of Object.entries(pathMapping)) {
      let regex = new RegExp(pattern, 'i');
      if (regex.test(moduleName)) {
        let moduleDir = dirname(moduleName);
        let absolutePath = moduleName.replace(regex, replacement);
        return (this.#stylesImportPath = `./${relative(moduleDir, absolutePath)}`);
      }
    }

    throw new Error(`Unable to determine a styles import path for module ${moduleName}`);
  }

  #runtimeHelper(name: string, walkerPath: WalkerPath<AST.Node>): string {
    return this.#env.meta.jsutils.bindImport(
      this.#config.runtimeModule ?? 'glimmer-local-class-transform/-runtime',
      name,
      walkerPath,
    );
  }

  #importStyles(stylesPath: string, walkerPath: WalkerPath<AST.Node>): string {
    return this.#env.meta.jsutils.bindImport(stylesPath, 'default', walkerPath, {
      nameHint: 'styles',
    });
  }
}
