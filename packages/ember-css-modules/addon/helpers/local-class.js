import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';
import require from 'require';

export function localClass(params, hash) {
  assert('No source specified to local-class lookup', 'from' in hash);
  if (!hash.from) {
    return '';
  }

  let styles = resolveSource(hash.from);
  let classes = (params[0] || '').split(/\s+/);

  return classes
    .map((style) => styles[style])
    .filter(Boolean)
    .join(' ');
}

export default helper(localClass);

function resolveSource(source) {
  if (typeof source === 'string') {
    if (require.has(source)) {
      return require(source).default;
    } else {
      throw new Error(
        `Unable to resolve local class names from ${source}; does the styles file exist?`
      );
    }
  } else {
    return source;
  }
}
