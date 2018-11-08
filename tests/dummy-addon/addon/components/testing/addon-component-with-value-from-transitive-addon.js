import Component from '@ember/component';
import layout from '../../templates/components/testing/addon-component-with-value-from-transitive-addon';
import styles from '../../styles/components/testing/addon-component-with-value-from-transitive-addon';

export default Component.extend({
  layout,
  styles
});
