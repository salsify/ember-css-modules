# old-app

This test package contains an app set up with the oldest ecosystem components we support:
 - `ember-cli@2.16`
 - `ember-cli-babel@6`
 - `ember-source@2.16`
 - `@ember-decorators/babel-transforms@2`
 - `broccoli-css-modules@0.7`
 - `broccoli-postcss@4`
 - `postcss@7`

Additionally, the test suite for this app is run under Node 6, as that's the oldest Node version we currently support.
Because of that, it's not part of the yarn workspaces setup at the root of this repo, as many other transitive (development) dependencies have dropped support for older Node versions.
