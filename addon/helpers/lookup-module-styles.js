import Ember from 'ember';

export function lookupModuleStyles([stylesMap, localClassStyles]) {
  return localClassStyles.split(' ')
                         .map(style => stylesMap[style])
                         .filter(style => style)
                         .join(' ');
}

export default Ember.Helper.helper(lookupModuleStyles);
