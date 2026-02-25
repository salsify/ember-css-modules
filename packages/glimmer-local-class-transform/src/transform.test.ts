import { describe, test, expect } from 'vitest';
import { preprocess, print } from '@glimmer/syntax';
import { LocalClassConfig, localClassTransform } from './transform.js';

describe('Template transform', () => {
  function transform(
    text: string,
    options?: LocalClassConfig,
  ): {
    contents: string;
    imports: Record<string, Record<string, string>>;
  } {
    let imports: Record<string, Record<string, string>> = {};
    let contents = print(
      preprocess(text, {
        mode: 'codemod',
        plugins: { ast: [localClassTransform(options)] },
        // @ts-expect-error: moduleName is typed as (optionally) appearing in `meta`, but in practice is only consistently set at the top level
        moduleName: 'test.hbs',
        meta: {
          jsutils: {
            bindImport: (
              moduleSpecifier: string,
              exportedName: string,
              walkerPath: unknown,
              options: { nameHint?: string } = {},
            ) => {
              imports[moduleSpecifier] ??= {};
              imports[moduleSpecifier][exportedName] = options.nameHint ?? exportedName;
              return imports[moduleSpecifier][exportedName];
            },
          },
        } as any,
      }),
    );
    return { contents, imports };
  }

  describe('styles path resolution', () => {
    test('empty mapping', () => {
      expect(() =>
        transform('<div local-class="foo"></div>', { pathMapping: {} }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Unable to determine a styles import path for module test.hbs]`,
      );
    });

    test('mapping with no match', () => {
      expect(() =>
        transform('<div local-class="foo"></div>', {
          pathMapping: {
            'foo.js': 'foo-styles.css',
            'bar.js': 'bar-styles.css',
          },
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Unable to determine a styles import path for module test.hbs]`,
      );
    });

    test('simple mapping', () => {
      expect(
        transform('<div local-class="foo"></div>', {
          pathMapping: { 'test.hbs': 'elsewhere.module.css' },
        }),
      ).toMatchInlineSnapshot(`
        {
          "contents": "<div class={{classNames styles "foo"}}></div>",
          "imports": {
            "./elsewhere.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('capture groups', () => {
      expect(
        transform('<div local-class="foo"></div>', {
          pathMapping: { '(.*)\\.hbs': '$1-styles.css' },
        }),
      ).toMatchInlineSnapshot(`
        {
          "contents": "<div class={{classNames styles "foo"}}></div>",
          "imports": {
            "./test-styles.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });
  });

  describe('local-class attribute', () => {
    test('<div class="foo"></div>', () => {
      expect(transform('<div class="foo"></div>')).toMatchInlineSnapshot(`
        {
          "contents": "<div class="foo"></div>",
          "imports": {},
        }
      `);
    });

    test('<div local-class="foo"></div>', () => {
      expect(transform('<div local-class="foo"></div>')).toMatchInlineSnapshot(`
        {
          "contents": "<div class={{classNames styles "foo"}}></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('<div class="foo" local-class="bar"></div>', () => {
      expect(transform('<div class="foo" local-class="bar"></div>')).toMatchInlineSnapshot(`
        {
          "contents": "<div class="foo {{classNames styles "bar"}}"></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('<div local-class={{foo}}></div>', () => {
      expect(transform('<div local-class={{foo}}></div>')).toMatchInlineSnapshot(`
        {
          "contents": "<div class={{classNames styles foo}}></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('<div local-class="foo {{bar}}"></div>', () => {
      expect(transform('<div local-class="foo {{bar}}"></div>')).toMatchInlineSnapshot(`
        {
          "contents": "<div class={{classNames styles (join "foo " bar)}}></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
              "join": "join",
            },
          },
        }
      `);
    });

    test('<div class="foo" local-class={{bar}}></div>', () => {
      expect(transform('<div class="foo" local-class={{bar}}></div>')).toMatchInlineSnapshot(`
        {
          "contents": "<div class="foo {{classNames styles bar}}"></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('<div class="foo" local-class="{{bar}} baz"></div>', () => {
      expect(transform('<div class="foo" local-class="{{bar}} baz"></div>')).toMatchInlineSnapshot(`
        {
          "contents": "<div class="foo {{classNames styles (join bar " baz")}}"></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
              "join": "join",
            },
          },
        }
      `);
    });

    test('<div class={{foo}} local-class="bar"></div>', () => {
      expect(transform('<div class={{foo}} local-class="bar"></div>')).toMatchInlineSnapshot(`
        {
          "contents": "<div class="{{foo}} {{classNames styles "bar"}}"></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('<div class="{{foo}} bar" local-class="baz"></div>', () => {
      expect(transform('<div class="{{foo}} bar" local-class="baz"></div>')).toMatchInlineSnapshot(`
        {
          "contents": "<div class="{{foo}} bar {{classNames styles "baz"}}"></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('<div class={{foo}} local-class="{{bar}} baz"></div>', () => {
      expect(transform('<div class={{foo}} local-class="{{bar}} baz"></div>'))
        .toMatchInlineSnapshot(`
        {
          "contents": "<div class="{{foo}} {{classNames styles (join bar " baz")}}"></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
              "join": "join",
            },
          },
        }
      `);
    });

    test('<div class="{{foo}} bar" local-class="{{baz}} qux"></div>', () => {
      expect(transform('<div class="{{foo}} bar" local-class="{{baz}} qux"></div>'))
        .toMatchInlineSnapshot(`
        {
          "contents": "<div class="{{foo}} bar {{classNames styles (join baz " qux")}}"></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
              "join": "join",
            },
          },
        }
      `);
    });

    test('{{curly-component local-class="foo"}}', () => {
      expect(transform('{{curly-component local-class="foo"}}')).toMatchInlineSnapshot(`
        {
          "contents": "{{curly-component class=(classNames styles "foo")}}",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('{{curly-component class="foo" local-class="bar"}}', () => {
      expect(transform('{{curly-component class="foo" local-class="bar"}}')).toMatchInlineSnapshot(`
        {
          "contents": "{{curly-component class=(join "foo" " " (classNames styles "bar"))}}",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
              "join": "join",
            },
          },
        }
      `);
    });

    test('{{curly-component class=foo local-class="bar"}}', () => {
      expect(transform('{{curly-component class=foo local-class="bar"}}')).toMatchInlineSnapshot(`
        {
          "contents": "{{curly-component class=(join foo " " (classNames styles "bar"))}}",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
              "join": "join",
            },
          },
        }
      `);
    });

    test('{{#curly-component local-class="foo"}}{{/curly-component}}', () => {
      expect(transform('{{#curly-component local-class="foo"}}{{/curly-component}}'))
        .toMatchInlineSnapshot(`
        {
          "contents": "{{#curly-component class=(classNames styles "foo")}}{{/curly-component}}",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('{{#curly-component class="foo" local-class="bar"}}{{/curly-component}}', () => {
      expect(transform('{{#curly-component class="foo" local-class="bar"}}{{/curly-component}}'))
        .toMatchInlineSnapshot(`
        {
          "contents": "{{#curly-component class=(join "foo" " " (classNames styles "bar"))}}{{/curly-component}}",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
              "join": "join",
            },
          },
        }
      `);
    });

    test('{{#curly-component class=foo local-class="bar"}}{{/curly-component}}', () => {
      expect(transform('{{#curly-component class=foo local-class="bar"}}{{/curly-component}}'))
        .toMatchInlineSnapshot(`
        {
          "contents": "{{#curly-component class=(join foo " " (classNames styles "bar"))}}{{/curly-component}}",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
              "join": "join",
            },
          },
        }
      `);
    });
  });

  describe('local-class helper', () => {
    test('<div class={{local-class "foo"}}></div>', () => {
      expect(transform('<div class={{local-class "foo"}}></div>')).toMatchInlineSnapshot(`
        {
          "contents": "<div class={{classNames styles "foo"}}></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('<div class={{local-class "foo" from="@some/other-module"}}></div>', () => {
      expect(transform('<div class={{local-class "foo" from="@some/other-module"}}></div>'))
        .toMatchInlineSnapshot(`
        {
          "contents": "<div class={{classNames styles "foo"}}></div>",
          "imports": {
            "@some/other-module": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('<div class="foo {{local-class bar}}"></div>', () => {
      expect(transform('<div class="foo {{local-class bar}}"></div>')).toMatchInlineSnapshot(`
        {
          "contents": "<div class="foo {{classNames styles bar}}"></div>",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('<div class="foo {{local-class bar from="@some/other/module"}}"></div>', () => {
      expect(transform('<div class="foo {{local-class bar from="@some/other/module"}}"></div>'))
        .toMatchInlineSnapshot(`
        {
          "contents": "<div class="foo {{classNames styles bar}}"></div>",
          "imports": {
            "@some/other/module": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('{{curly-component class=(local-class "bar")}}', () => {
      expect(transform('{{curly-component class=(local-class "bar")}}')).toMatchInlineSnapshot(`
        {
          "contents": "{{curly-component class=(classNames styles "bar")}}",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });

    test('{{#curly-component class=(local-class "bar")}}{{/curly-component}}', () => {
      expect(transform('{{#curly-component class=(local-class "bar")}}{{/curly-component}}'))
        .toMatchInlineSnapshot(`
        {
          "contents": "{{#curly-component class=(classNames styles "bar")}}{{/curly-component}}",
          "imports": {
            "./test.module.css": {
              "default": "styles",
            },
            "glimmer-local-class-transform/-runtime": {
              "classNames": "classNames",
            },
          },
        }
      `);
    });
  });
});
