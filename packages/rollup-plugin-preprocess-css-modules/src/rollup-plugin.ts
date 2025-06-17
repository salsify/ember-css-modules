import type { Plugin, PluginContext, SourceMapInput } from 'rollup';
import { Minimatch } from 'minimatch';
import postcss from 'postcss';
import modules from 'postcss-modules';

type SeenRecord = { css: string; js: string; json: Record<string, string>; map: SourceMapInput };

export type PreprocessCSSModulesConfig = {
  include?: string;
  generateScopedName?: (name: string, filename: string, css: string) => string;
  getOutputFilename?: (filename: string) => string;
};

export function preprocessCSSModules({
  include = '**/*.module.css',
  getOutputFilename = (filename: string) => filename.replace(/\.module\.css$/, '.css'),
  generateScopedName,
}: PreprocessCSSModulesConfig = {}): Plugin<unknown> {
  let seen = new Map<string, SeenRecord>();
  let includeMatcher = new Minimatch(include, {});

  return {
    name: 'rollup-plugin-preprocess-css-modules',

    async resolveId(source, importer, options) {
      let { cssModuleSource } = options.attributes;
      if (cssModuleSource) {
        this.addWatchFile(cssModuleSource);
        return { id: source, meta: { cssModuleSource } };
      } else {
        let file = await this.resolve(source, importer, { ...options, skipSelf: true });
        if (file && includeMatcher.match(file.id)) {
          return { ...file, id: `${file.id}.js`, meta: { ...file.meta, cssModule: true } };
        }
      }
    },

    async load(id) {
      let meta = this.getModuleInfo(id)?.meta;
      if (meta?.cssModuleSource) {
        return seen.get(meta.cssModuleSource)?.css;
      } else if (meta?.cssModule) {
        let result = await processModule(this, id);
        return result.js;
      }
    },
  };

  async function processModule(ctx: PluginContext, id: string): Promise<SeenRecord> {
    let inputPath = id.replace(/\.js$/, '');
    let outputPath = getOutputFilename(inputPath);
    let rawContent = await ctx.fs.readFile(inputPath, { encoding: 'utf8' });
    let js: string | undefined, json: Record<string, string> | undefined;
    let processor = postcss([
      modules({
        generateScopedName,
        Loader: class {
          async fetch(path: string, fromModule: string) {
            let resolved = await ctx.resolve(path, fromModule, { skipSelf: false });
            if (resolved) await ctx.load(resolved);
            return (
              seen.get(resolved?.id.replace(/\.js$/, '') ?? '')?.json ??
              ctx.error('Internal error: CSS module mapping not found')
            );
          }
        },
        getJSON: (inputFilename, mapping) => {
          if (inputFilename === inputPath) {
            json = mapping;
            js = [
              `import ${JSON.stringify(outputPath)} with { cssModuleSource: ${JSON.stringify(inputPath)} };`,
              `export default ${JSON.stringify(json)};`,
            ].join('\n');
          }
        },
      }),
    ]);

    let { css, map } = await processor.process(rawContent, { from: inputPath, to: outputPath });
    if (!js || !json) {
      throw new Error(`Failed to process CSS module: ${inputPath}`);
    }

    let result = { js, json, css, map: map?.toJSON() as SourceMapInput };
    seen.set(inputPath, result);
    return result;
  }
}
