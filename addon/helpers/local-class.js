import Ember from 'ember';

export function localClass(params, hash) {
  Ember.assert('No source specified to local-class lookup', 'from' in hash);
  if (!hash.from) { return ''; }

  let styles = resolveSource(hash.from);
  let classes = (params[0] || '').split(/\s+/);

  return classes.map(style => styles[style]).filter(Boolean).join(' ');
}

export default Ember.Helper.helper(localClass);

function resolveSource(source) {
  if (typeof source === 'string') {
    return window.require(source).default;
  } else {
    return source;
  }
}
