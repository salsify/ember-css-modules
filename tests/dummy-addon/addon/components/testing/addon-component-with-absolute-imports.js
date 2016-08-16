import Ember from 'ember';
import layout from '../../templates/components/testing/addon-component-with-absolute-imports';
import styles from '../../styles/components/testing/addon-component-with-absolute-imports';

export default Ember.Component.extend({
  layout,
  styles
});
