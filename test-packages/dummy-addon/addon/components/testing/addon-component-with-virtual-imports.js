import Component from '@ember/component';
import layout from '../../templates/components/testing/addon-component-with-virtual-imports';
import styles from '../../styles/components/testing/addon-component-with-virtual-imports';

export default Component.extend({
  layout,
  styles
});
