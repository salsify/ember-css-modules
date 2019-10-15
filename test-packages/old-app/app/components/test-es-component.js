import Component from '@ember/component';
import { localClassNames, localClassName } from 'ember-css-modules';

@localClassNames('test-es-component')
export default class TestESComponent extends Component {
  @localClassName get prop() {
    return 'test-es-component-bound';
  }
}
