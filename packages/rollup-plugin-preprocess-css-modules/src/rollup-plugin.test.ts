import { readdir, readFile } from 'node:fs/promises';
import { OutputOptions, rollup } from 'rollup';
import { Project } from 'fixturify-project';
import { describe, test, expect } from 'vitest';
import { stripIndent } from 'common-tags';
import { Addon } from '@embroider/addon-dev/rollup';
import { preprocessCSSModules } from './rollup-plugin.js';

describe('rollup-plugin-preprocess-css-modules', () => {
  type Tree = { [name: string]: string | Tree };
  async function readTree(path: string): Promise<Tree> {
    let result: Tree = {};
    for (let entry of await readdir(path, { withFileTypes: true })) {
      let fullPath = `${path}/${entry.name}`;
      if (entry.isDirectory()) {
        result[entry.name] = await readTree(fullPath);
      } else if (entry.isFile()) {
        result[entry.name] = await readFile(fullPath, { encoding: 'utf8' });
      }
    }
    return result;
  }

  test('generally works', async () => {
    let project = new Project({
      files: {
        src: {
          'index.js': stripIndent`
            import styles from './styles.module.css';
            
            export const fooClass = styles.foo;
          `,
          'constants.module.css': stripIndent`
            @value fooColor: green;
          `,
          'styles.module.css': stripIndent`
            @value fooColor from './constants.module.css';
            
            .foo {
              color: fooColor;
            }
          `,
          'unused.module.css': stripIndent`
            .unused {
              color: red;
            }
          `,
        },
      },
    });

    let addon = new Addon({
      srcDir: `${project.baseDir}/src`,
      destDir: `${project.baseDir}/dist`,
    });

    await project.write();

    let bundle = await rollup({
      plugins: [
        addon.publicEntrypoints(['index.js']),
        preprocessCSSModules({
          generateScopedName: (name) => `_${name}_abc123_`,
        }),
        addon.keepAssets(['**/*.css']),
      ],
    });

    await bundle.write(addon.output() as OutputOptions);

    let watchFiles = bundle.watchFiles.map((file) =>
      file.replace(project.baseDir, '').replace(/\\/g, '/'),
    );

    expect(new Set(watchFiles)).toEqual(
      new Set([`/src/index.js`, `/src/constants.module.css`, `/src/styles.module.css`]),
    );

    expect(await readTree(`${project.baseDir}/dist`)).toEqual({
      'index.js':
        stripIndent`
          import "./styles.css"
          ;

          var styles = {"foo":"_foo_abc123_"};

          const fooClass = styles.foo;

          export { fooClass };
          //# sourceMappingURL=index.js.map
        ` + '\n',
      'styles.css': stripIndent`
        ._foo_abc123_ {
          color: green;
        }
      `,
      'index.js.map': `{"version":3,"file":"index.js","sources":[],"sourcesContent":[],"names":[],"mappings":""}`,
    });
  });
});
