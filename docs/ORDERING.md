# Module Ordering

All `.css` files in your `app`/`addon` directories are automatically concatenated into a single output file. Since [the ordering of rules in CSS is what breaks specificity ties](https://developer.mozilla.org/en/docs/Web/CSS/Specificity), the details of this concatenation can be important.

## Implicit Dependencies

Where possible, ember-css-modules takes advantage of information it has about the dependencies between your CSS modules when making decisions about ordering. Any time, for instance, a class in one module `a` composes a class in module `b`, the contents of module `b` will be included earlier in the file output than the contents of `a`. This means you can override properties from composed classes without worrying about specificity hacks:

```css
/* app/styles/b.css */
.b {
  color: green;
  font-weight: bold;
}
```

```css
/* app/styles/a.css */
.a {
  composes: b from './b';
  color: orange;
}
```

## Explicit Dependencies

You may also have cases where you want certain files to be included early in the concatenated CSS without specifically pulling a class or value from those files. This may be common if, for example, you have a set of global base classes in your application. To meet this goal, ember-css-modules provides the `@after-module` at-rule to explicitly declare that one module should be included after another.

```css
/* app/styles/app.css */
@after-module './base/simple-elements';
@after-module './base/typography';
```

In the above example, the two files referenced are guaranteed to be included before the actual contents of `app.css`. Where possible, all files that are part of an explicit `@after-module` dependency graph will be included before modules that are connected via implicit dependencies.

#### Final Output

Given the rules above, the final ordering for the modules included in an app or addon build will look something like this:

```
<modules containing or referenced by @after-module rules>
<modules connected via composes: or @value imports>
<all other modules>
```
