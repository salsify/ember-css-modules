import Ember from 'ember';

export function lookupModuleStyles([classStyles, stylesMap, localClassStyles]) {
  const classStylesArray = classStyles ? classStyles.split(' ') : [];
  const appliedlocalClassStylesArray = localClassStyles.split(' ')
                                                       .map(style => stylesMap[style])
                                                       .filter(style => style);

  return classStylesArray.concat(appliedlocalClassStylesArray).join(' ');
}

export default Ember.Helper.helper(lookupModuleStyles);
