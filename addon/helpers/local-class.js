import Ember from 'ember';

export function localClass([classString], { from }) {
  Ember.assert('No source specified to local-class lookup', from);

  let styles = resolveSource(from);
  let classes = classString.split(/\s+/);

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
