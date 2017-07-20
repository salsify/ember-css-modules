# Module Ordering

All `.css` files in your `app`/`addon` directories are automatically concatenated into a single output file. Since [the ordering of rules in CSS is what breaks specificity ties](https://developer.mozilla.org/en/docs/Web/CSS/Specificity), the details of this concatenation can be important.

## Implicit Ordering

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

## Explicit Ordering

You may also have cases where you explicitly want certain modules to be included early or late in the concatenated CSS. This may be common if, for example, you have a set of global base classes in your application.

To meet this goal, you can declare `headerModules` and `footerModules` in your ember-css-modules configuration.

```js
cssModules: {
  headerModules: [
    'my-app/styles/simple-elements',
    'my-app/styles/typography'
  ]
}
```

You use the same paths when configuring `headerModules` and `footerModules` as you would with `@value` and `composes`.

#### Final Output

Given the rules above, the final ordering for the modules included in an app or addon build will look something like this:

```
<modules configured in headerModules>
<modules connected via composes: or @value imports>
<modules with no connections and no explicit ordering>
<modules configured in footerModules>
```
