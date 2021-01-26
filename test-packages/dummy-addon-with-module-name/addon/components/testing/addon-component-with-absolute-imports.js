import Component from '@ember/component';
import layout from '../../templates/components/testing/addon-component-with-absolute-imports';
import styles from '../../styles/components/testing/addon-component-with-absolute-imports';

export default Component.extend({
  layout,
  styles
});
