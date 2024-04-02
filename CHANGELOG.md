# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

## Unreleased

## 2.1.0 (April 2, 2024)

### Added
- Glint types for `{{local-class}}` [#301](https://github.com/salsify/ember-css-modules/pull/301) (thanks, [@SergeAstapov](https://github.com/SergeAstapov)!)

## 2.0.1 (March 23, 2022)

### Fixed
- Avoid triggering (ember.js#19392)[https://github.com/emberjs/ember.js/issues/19392] when we produce synthetic class `AttrNode`s.

## 2.0.0 (November 22, 2021)

This major release of Ember CSS Modules primarily removes support for deprecated patterns and updates our minimum support for other elements of the ecosystem.

### Compatibility

Ember CSS Modules is now tested against the following as _minimum_ supported versions:
 - Ember 3.24
 - Ember CLI 3.24
 - Node 12

Older Ember and Node versions may incidentally work, but are no longer officially supported.

### Removed

While ECM will still work for templates backed by `Ember.Component` classes, all special handling for such components' implicit root element has been removed, in line with the broader ecosystem shift to template-only and `@glimmer/component` components. This includes the following removals:

 - the `@localClassNames` and `@localClassName` decorators
 - support for `localClassNames` and `localClassNameBindings` properties
 - the `patchClassicComponent` configuration flag

Special support for `Ember.Component` was deprecated in v1.5.0 of `ember-css-modules`; see the changelog for that release for further advice on migrating to newer Octane-based component APIs.

## 1.6.0 (November 19, 2021)
### Added
- You can now pass `patchClassicComponent: false` in your ECM config to opt out of the deprecated monkeypatching of `Ember.Component` that will be removed entirely in 2.0 (thanks @SergeAstapov!)

### Fixed
- Modules whose path includes the name of the package they're in no longer cause issues when resolving `@value` and `composes:` directives (thanks @eshirley and @maxfierke!)

## 1.5.0 (July 6, 2021)
### Deprecated
- ECM's support for binding local class names on the root element of a classic `Ember.Compnent` (the `localClassNames` and `localClassNameBindings` properties and the `@localClassName` and `@localClassNames` decorators) has been deprecated and will be removed in the next major release. These APIs rely on reopening `Ember.Component` (which is itself [now deprecated](https://github.com/emberjs/rfcs/pull/671)) and can be replaced by several alternative patterns. See the Upgrade Notes section below for migration suggestions.

### Upgrade Notes
For classic `@ember/component` subclasses, `ember-css-modules` has had support for binding static and dynamic local class names to the component's root element using either `.extend()` or decorator syntax:

```js
export default Component.extend({
  localClassNames: ['always-present'],
  localClassNameBindings: ['flipACoin'],

  flipACoin: computed(function() {
    return Math.random() > 0.5 ? 'yes-class' : 'no-class';
  }),
});
```

```js
@localClassNames('always-present')
export default class MyComponent extends Component {
  @localClassName flipACoin = Math.random() > 0.5 ? 'yes-class' : 'no-class';
}
```

Both versions of these APIs are now deprecated, as:
  1. they rely on monkey-patching `Ember.Component`, which is itself [now deprecated](https://github.com/emberjs/rfcs/pull/671)
  1. they're parallels of the `classNames` and `classNameBindings` APIs that are no longer relevant in modern Ember applications

Depending on your appetite for refactoring and modernizing, you might take one of three approaches to migrating off of these APIs:
  1. Convert your components to use the modern `@glimmer/component` base class instead of `@ember/component`. Since Glimmer component templates have "outer HTML" semantics, there's no implicit root element for these APIs to apply to. See the [Octane vs Classic cheat sheet](https://ember-learn.github.io/ember-octane-vs-classic-cheat-sheet/) for further details on the differences between classic and Glimmer components.
  1. Use `tagName: ''` to remove the implicit root element from your classic component, then add a corresponding explicit root element to your template, where you can use `local-class` as you would for any other element.
  1. Import the class name mapping from your styles module and use that with the classic `classNames` and `classNameBindings` APIs:
     ```js
     import styles from './styles';

     export default Component.extend({
       classNames: [styles['always-present']],
       classNameBindings: ['flipACoin'],

       flipACoin: computed(function() {
         return Math.random() > 0.5 ? styles['yes-class'] : styles['no-class'];
       }),
     });
     ```

## 1.4.0 (May 17, 2021)
### Added
- We now support a wider range of dependencies that includes PostCSS 8 out of the box. Depending on your package manager, you'll likely see this upgrade take effect automatically when you update ECM, and you may see deprecation warnings for any older PostCSS plugins you're using.

### Upgrade Notes
If you're using older PostCSS plugins or an older Node version and wish to continue using PostCSS 7, the appropriate dependency versions are still in range for ECM, and we still run tests against them. The easiest way to lock to those versions locally is likely with `resolutions` entries, which you can see [an example of](test-packages/old-app/package.json) in `test-package/old-app`.

```json
  "resolutions": {
    "ember-css-modules/broccoli-css-modules": "^0.7.0",
    "ember-css-modules/broccoli-postcss": "^4.0.3",
    "ember-css-modules/postcss": "^7.0.35"
  },
```

## 1.3.4 (February 2, 2021)
### Fixed
- Ensure styles from addons that define a custom `moduleName` use correct import paths ([#220](https://github.com/salsify/ember-css-modules/pull/220); thank you [@timlindvall](https://github.com/timlindvall)!)

## 1.3.3 (October 19, 2020)
### Fixed
- Ensure addons use the host app's `generateScopedName` for consistency if they don't have their own configured.

## 1.3.2 (August 28, 2020)
### Fixed
- Ensure `ember-css-modules` is initialized before `ember-cli-htmlbars`. This almost always was coincidentally the case already, but ordering constraints from other addons _could_ cause ECM to init later, causing `local-class` in colocated templates not to be processed, as in [ember-concurrency-async#4](https://github.com/chancancode/ember-concurrency-async/issues/4)

## 1.3.1 (May 26, 2020)
### Fixed
- Ensure local imports work with CLI 3.12 [#197](https://github.com/salsify/ember-css-modules/pull/197)

## 1.3.0 (April 20, 2020)

This is a stable release of the changes included in 1.3.0-beta.1 and -beta.2. Headline additions include support for building in projects using `@embroider/concat` and for defining styles when writing components in the [component/template colocation layout](https://github.com/emberjs/rfcs/blob/master/text/0481-component-templates-co-location.md).

## 1.3.0-beta.2 Help Me Out (April 10, 2020)
### Added
- Support for Embroider's `staticHelpers` flag. [#188](https://github.com/salsify/ember-css-modules/pull/188)

### Fixed
- Timing changes to when ECM calculates its configuration caused some addons that late-defined their options (e.g. in their `included()` hook) not to be picked up correctly. This timing has been reverted to match that of ECM stable. [#186](https://github.com/salsify/ember-css-modules/pull/186)
- ECM no longer emits a nonsense error message without actionable information when a bad import path is specified for a `@value` or `composes` directive. [#186](https://github.com/salsify/ember-css-modules/pull/186)

## 1.3.0-beta.1 Come Together (October 2, 2019)
### Added
- Experimental support for apps built using [`@embroider/compat`](https://github.com/embroider-build/embroider). Note that, until [embroider-build/embroider#309](https://github.com/embroider-build/embroider/issues/309) is fixed, CSS changes will likely not show up on rebuilds (though corresponding JS changes will)
- Experimental support for components in the Octane "colocation" layout (see [the README](https://github.com/salsify/ember-css-modules#component-colocation-in-octane-applications) for details.)
- A new `includeExtensionInModulePath` option that, when set to `true`, will include `.css` (or whatever your configured extension is) in the import path for your modules. Note that the extension is always included in the module name for colocated styles in order not to conflict with the component definition itself.

## 1.2.1 Form Over Function (July 8, 2019)
### Fixed
- Support new template factory format coming in Ember 3.13 [#146](https://github.com/salsify/ember-css-modules/pull/146)

## 1.2.0 What's Old is New Again (April 16, 2019)
### Added
- ember-css-modules now works in projects using either stage 1 or stage 2 of the decorators proposal, regardless of whether you're using `@ember-decorators/*`, `ember-decorators-polyfill`, or built-in decorator support via `ember-cli-babel` >= 7.7 and Ember 3.10.

## 1.1.2 Parallelogram (April 4, 2019)
### Fixed
- ECM's template AST transform no longer prevents ember-cli-babel from performing parallel transpilation.

## 1.1.1 Decorum (February 25, 2019)
### Added
- ember-css-modules now officially supports being installed in projects running either the 3.x or 5.x series of ember-decorators releases [#134](https://github.com/salsify/ember-css-modules/pull/134)

## 1.1.0 Stage Fright (November 26, 2018)
### Added
- `@localClassNames` and `@localClassName` now support projects using either stage 1 or stage 2 of the decorators proposal.

## 1.0.3 High Resolution (November 8, 2018)
### Fixed
- Resolving `@value`s and class names from addons no longer fails for addons that aren't dependencies of the root application. [#125](https://github.com/salsify/ember-css-modules/issues/125)
- Projects using ember-css-modules with other preprocessors (like ember-cli-sass) should no longer see those preprocessors fully rebuild when unrelated files (like templates) change. [#120](https://github.com/salsify/ember-css-modules/issues/120)

## 1.0.2 I Can't Get No Satisfaction (November 6, 2018)
### Fixed
- The `@localClassName` decorator now properly works with getters across various Babel and TypeScript versions. [#118](https://github.com/salsify/ember-css-modules/pull/118)

### Changed
- We're now using `broccoli-postcss@4` (which itself uses `postcss@7`) for `postprocess` plugins. This should be a non-breaking change for our usage in this addon. [#124](https://github.com/salsify/ember-css-modules/pull/124)

## 1.0.1 Things That Go Splat in the Night (September 28, 2018)
### Fixed
- Elements with both `local-class` and `...attributes` should no longer lose their local class when an external `class` or `local-class` is passed in. [#116](https://github.com/salsify/ember-css-modules/issues/116)

## 1.0.0 The Big Dig (September 20, 2018)

### Migrating from 0.7.x
The 1.0 release should largely be a drop-in replacement coming from 0.7.x, but there are a few changes to be aware of:
- Referencing a `local-class` in a template that doesn't have a corresponding `styles` module is now a hard error (before it would silently fail and add no class to the target element).
- Using `localClassNames` or `localClassNameBindings` on a component with no template is no longer possible. You can either create an empty template for that component or import the styles module and set `classNames` or `classNameBindings` using the imported mapping, e.g. `classNames: styles['my-local-class']`.

### Fixed
- The type declaration for `localClassNames` now uses the right identifier
- The error message when referencing a `local-class` in a template with no styles module is now more informative

If you're migrating from 0.7.x, see the release notes for the 1.0 betas below for additional changes and fixes.

## 1.0.0-beta.2 Decorations (September 13, 2018)

### Added
- The long awaited `@localClassNames` and `@localClassName` decorators, which work as parallels to `ember-decorators`' [`@classNames` and `@className`](http://ember-decorators.github.io/ember-decorators/latest/docs/api/modules/@ember-decorators/component), are now available.

### Fixed
- Turns out there was one breaking change from the 0.7 series: components must now have a template in order for their `localClassNames` and `localClassNameBindings` (as well as the decorator versions) to resolve. The error message for this scenario has been improved to provide more actionable details.

## 1.0.0-beta.1 Ch-ch-changes (September 6, 2018)

This release is the first beta for Ember CSS Modules 1.0. There are no known breaking changes since 0.7.10, but as described below, there were a few internal refactorings, so we'll run a beta series before christening the official 1.0 🎉

### Added
- `addPostcssPlugin` now accepts multiple arguments ([#103](https://github.com/salsify/ember-css-modules/pull/103))

### Fixed
- The `template-only-glimmer-components` feature should no longer conflict with ember-css-modules ([#98](https://github.com/salsify/ember-css-modules/issues/98))

### Changed
- The majority of the runtime monkeypatching that was present in this addon has been removed in favor of build-time processing. The only remaining runtime code is the `{{local-class}}` helper and an extension to the `Component` class to support `localClassNames` and `localClassNameBindings`. ([#99](https://github.com/salsify/ember-css-modules/pull/99))

## 0.7.10 Super Scope (March 1, 2018)
### Fixed
- Support importing styles via `@value` and `composes:` from addons with `@scope`ed names.

## 0.7.9 Party Like It's 1992 (February 22, 2018)
### Fixed
- Ember 3.1 ships with a version of Glimmer that expects AST transforms to use [a singular `visitor` key rather than plural `visitors`](https://github.com/glimmerjs/glimmer-vm/pull/557). So we do that. Big thanks to [@luqman](https://github.com/luqman) for tracking this down.
- The internal computed property we set up to support `localClassNameBindings` now uses Ember's `defineProperty` for compatibility with the ES5 getters overhaul.

## ~0.7.8 Let's Pretend This Never Happened (February 22, 2018)~
### Changed
- Nothing. This was essentially a no-op republish of 0.7.7.

## 0.7.7 Prelease Blues (February 6, 2018)
### Fixed
- Prerelease versions of Ember CLI are correctly detected now.

## 0.7.6 Lint Roller (January 29, 2018)
### Added
- The plugin system now supports a notion of lint plugins, which will activate for developing addons even when they're in `devDependencies`.

## 0.7.5 Everything is Awesome (January 8, 2018)
### Fixed
- The `local-class` template transform should now play nicely with ember-font-awesome's own transforms (thanks [@buschtoens](https://github.com/buschtoens)!)
- The plugin registry no longer explodes when addons with no package keywords are present (thanks [@devotox](https://github.com/deotox)!)

## 0.7.4 String Theory (November 10, 2017)
### Added
- The ability to use `{{local-class}}` to inject classes from other modules is now public and documented (thanks [@kellyselden](https://github.com/kellyselden)!)

### Fixed
- `localClassNameBindings` now works with string values instead of just booleans (thanks [@luxferresum](https://github.com/luxferresum)!)
- `headerFiles` and `footerFiles` will now accept file paths with and without extensions
- Setup for `localClassNames` and `localClassNameBindings` now short circuits to avoid extra work for tagless components (thanks [@garno](https://github.com/garno)!)

## 0.7.3 After All (August 16, 2017)
### Added
- PostCSS plugins can now be specified to run against the final concatenated output of all modules using the `postprocess` array (thanks [@alexlafroscia](https://github.com/alexlafroscia)!)

### Fixed
- During testing, `import 'ember-css-modules/extensions'` is no longer required to have styles function correctly in integration tests.
- When no styles for a component can be found, `localClassNameBindings` now silently binds no classes instead of throwing an error.

## 0.7.2 Everything In Its Place (July 19, 2017)
### Added
- Modules to be included at the top or bottom of the concatenated output can now be set via the `headerModules` and `footerModules` configuration options. See the [module ordering guide](docs/ORDERING.md) for details.

### Changed
- `@after-module` has been deprecated in favor of the new `headerModules`/`footerModules` configuration

## 0.7.1 AST But Not Least (July 16, 2017)
### Added
- Support for Ember 2.15's new form factor for template AST transforms has been added.

### Fixed
- Styles resolution for components and controllers no longer assumes only a single `:` in container keys.

## 0.7.0 Plug It In (June 11, 2017)
### Added
- An initial cut of a plugin system has been implemented, allowing common PostCSS plugin sets, shared configuration, and other bits of reusable code to be packaged up and redistributed. See the README for a few implemented examples.

### Changed
- The CSS Modules pipeline has been upgraded and now uses PostCSS 6
- Some of the more advanced topics in the README have been broken out into dedicated mini-guides in an effort to keep the main document from being so overwhelming

### Fixed
- Attempting to pull styles from an addon that doesn't exist now provides a useful error message (#65).

## 0.7.0-beta.1 The Little Engine That Could (April 3, 2017)
### Changed
- There have been some internal changes to how styles are read from the app/addon trees. This should be a non-breaking change (and fixes a number of oddities, including previous incompatibility with lazy engines), but is enough of a shift to warrant a version bump and a note.
- Attempting to import a nonexistent `@value` or `compose` a nonexistent class is now a hard error at build time.

### Removed
- Support for the deprecated `styles` property has been removed.

## 0.6.5 Time Marches On (March 16, 2017)
### Fixed
- The (deprecated) computed `styles` property is no longer read-only, to allow for other component APIs that expect something with that name to be passed in.
- Avoid repurposing `this.options` in the addon to support Ember CLI 2.12 (#64)

## 0.6.4 RTFM (December 12, 2016)
### Fixed
- Now actually avoid triggering the ember-getowner-polyfill deprecation notice.

## 0.6.3 Fix It In Post (December 12, 2016)
### Added
- This addon will now run before ember-cli-postcss, enabling cooperative preprocessing as with ember-cli-sass and friends (#58).

### Fixed
- Upgraded ember-getowner-polyfill and eliminated a deprecation warning from its changed usage.

## 0.6.2 Nothing Comes from Nothing (November 30, 2016)
### Fixed
- Null local class values, e.g. `local-class={{if false 'foo'}}` no longer result in an exception (#57).

## 0.6.1 Hush Now (November 22, 2016)
### Fixed
- Removed a spurious warning when specifying a local-class for a component that doesn't yet have styles.

## 0.6.0 Helping Hand (November 6, 2016)
### Added
- Mirroring the `local-class` attribute, there is now a `local-class` helper that can be used in templates to reference local classnames e.g. when passing them to child components as properties.

### Deprecated
- In the past, attempting to import a nonexistent class or value would silently fail. This behavior is now deprecated and will be a hard error in the future.
- Usage of the `styles` computed property on components and controllers is now deprecated.
  - In templates, you can replace `{{styles.class-name}}` with `{{local-class 'class-name'}}`.
  - In JavaScript code, you can import the styles object via a normal ES2015 `import`.
  - As a migration stepping stone, you can import the styles object and set it on your component/controller's prototype to mimic the old form factor:
    ```js
    import styles from './styles';

    export default Ember.Component.extend({
      styles,

      // ...
    });
    ```

### Removed
- Support for Ember 1.13 has been removed; ember-css-modules now supports Ember 2.0+.

## 0.5.1 Cartography Edition (November 6, 2016)
### Added
- Source maps can now be generated for applications, with caveats. See the README and [ember-cli/broccoli-concat#58](https://github.com/ember-cli/broccoli-concat/issues/58) for details.
- A warning is now issued for addons that have no `addon/styles` directory, since Ember CLI won't invoke registered CSS preprocessors in that scenario.

### Fixed
- Fewer files are `require`d when ember-css-modules loads, lessening the overall impact it should have on Ember CLI's startup time

## 0.5.0 Window of Opportunity (September 26, 2016)
### Added
- Windows is now fully supported (#52).

### Fixed
- `localClassNameBindings` now works with classes that use `composes` (#48).

## 0.4.4 Virtually Indistinguishable (September 7, 2016)
### Added
- Virtual modules that export constants can be configured at build time.

### Fixed
- The configured modules extension can now contain a `.` (see #41 for history)

## 0.4.3 Change is the Only Constant (August 28, 2016)
### Added
- The `local-class` attribute now accepts dynamic values (#40)
- Components may specify `localClassNames` and `localClassNameBindings`, similar to `classNames` and `classNameBindings` respectively, to bind local classes to their root elements (#26)

### Fixed
- Values with commas and quotes can now be exposed in modules (#22)

## 0.4.2 A Certain Cachet (August 12, 2016)
### Added
- The beginnings of support for `@value` and `composes:` from addons, with some caveats. Real documentation forthcoming once the feature has a little time to bake.

### Fixed
- Provide caching information for `ember-cli-htmlbars` so it can correctly invalidate when the plugin changes.

## 0.4.1 Glimmer in the Eye (August 2, 2016)
### Added
- Preliminary support for Glimmer 2 with the Ember alpha series.

## 0.4.0 Think Locally (July 12, 2016)
### Added
- Local class names can be specified via the `local-class` attribute (#31)
- PostCSS options such as custom syntax are passed through via `postcssOptions` config (#34)
- The default extension for modules can be specified via `extension` config (#34)

### Fixed
- An `intermediateOutputPath` may be specified in order to have ember-css-modules emit to a location other than `<app-name>.css`, leaving other files in the styles tree untouched for further processing (#28). See the README for further details on how this in combination with the changes in #34 allow for working alongside other CSS preprocessors.

## 0.3.3 If At First (July 6, 2016)
### Fixed
- `_super` is now properly called in the addon `init()` to avoid a deprecation notice

## 0.3.2 Hidden Gems (May 1, 2016)
### Fixed
- Hidden files (e.g. `.DS_Store`) no longer break the build process (#21)

### Changed
- Final linking of `@value`s now occurs _before_ other PostCSS plugins execute (#23)

## 0.3.1 Contain Your Excitement (April 14, 2016)
### Fixed
- Classes named `container` can be used once again (#15)

## 0.3.0 Location, Location, Location (Mar 31, 2016)
### Changed
- Modules are now more intelligently ordered in the final output by default, according to composition and value dependencies. See the README for further details.

### Added
- Ability to override scoped name generation (#3)
- Greater (explicit) control over module ordering in final output (#7)

### Fixed
- Handle component lookup changes in Ember 2.5+ without crashing
- Pass through non-CSS files in the styles tree (#13)
- Don't rely on custom registry options set up in an initializer (#14)
