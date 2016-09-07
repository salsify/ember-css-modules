import Ember from 'ember';
import layout from '../../templates/components/testing/addon-component-with-virtual-imports';
import styles from '../../styles/components/testing/addon-component-with-virtual-imports';

export default Ember.Component.extend({
  layout,
  styles
});
