# `rollup-plugin-preprocess-css-modules`

TODO

```js
// my-component.js
import styles from './my-component.module.css';
export default `
  <h1 class="${styles.title}">Hello, world!</h1>
`;
```

```css
/* my-component.module.css */
.title {
  color: darkblue;
}
```

===>

```js
// my-component.js
import styles from './my-component.module.css.js';
export default `
  <h1 class="${styles.title}">Hello, world!</h1>
`;
```

```js
// my-component.module.css.js
import './my-component.css';

export default {
  title: '_title_abc123_',
};
```

```css
/* my-component.css */
._title_abc123_ {
  color: darkblue;
}
```
