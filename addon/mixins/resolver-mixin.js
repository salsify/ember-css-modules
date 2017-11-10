import Mixin from '@ember/object/mixin';

export default Mixin.create({
  init() {
    this._super();
    this.pluralizedTypes.styles = 'styles';
  },

  podBasedLookupWithPrefix: function podBasedLookupWithPrefix(podPrefix, parsedName) {
    var fullNameWithoutType = parsedName.fullNameWithoutType;

    if (parsedName.type === 'template' || parsedName.type === 'styles') {
      fullNameWithoutType = fullNameWithoutType.replace(/^components\//, '');
    }

    return podPrefix + '/' + fullNameWithoutType + '/' + parsedName.type;
  }
});
