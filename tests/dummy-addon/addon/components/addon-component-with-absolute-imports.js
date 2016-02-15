import Ember from 'ember';
import layout from '../templates/components/addon-component-with-absolute-imports';
import styles from '../styles/components/addon-component-with-absolute-imports';

export default Ember.Component.extend({
  layout,
  styles
});
