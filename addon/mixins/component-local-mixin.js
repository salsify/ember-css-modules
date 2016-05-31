import Ember from 'ember';

function getLocalClassNames() {
  let localClassNames = [];

  this.localClassNameBindings.forEach((localClassNameBinding) => {
    // Split the classNameBinding by property/classIfTrue/classIfFalse
    const propStrings = localClassNameBinding.split(':');
    const propStringsLength = propStrings.length;
    const prop = propStrings[0];

    // The CSS class to apply
    let localClassName;

    // If/Else or If binding
    if (propStringsLength >= 2) {
      // Determine if the property is truthy or falsy
      const propVal = Boolean(this.get(prop));

      // If/Else binding
      if (propStringsLength === 3) {
        localClassName = propVal ? propStrings[1] : propStrings[2];
      }
      // If binding
      else if (propVal) {
        localClassName = propStrings[1];
      }
    }
    // Straight binding to the property
    else {
      localClassName = prop;
    }

    if (localClassName) {
      let scopedLocalClassName = this.get(`styles.${localClassName}`);
      localClassNames.push(scopedLocalClassName);
    }
  });

  return localClassNames;
}

function addLocalClassNames(localClassNames) {
  localClassNames = localClassNames || getLocalClassNames.call(this);

  // TODO Revert to original classNames?
  this.classNames = this.classNames.concat(localClassNames);
}

export default Ember.Mixin.create({
  localClassNameBindings: [],

  init() {
    this._super(...arguments);
    addLocalClassNames.call(this);
  },

  didUpdateAttrs() {
    this._super(...arguments);
    addLocalClassNames.call(this);
  }
});


