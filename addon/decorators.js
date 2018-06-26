import { assert } from '@ember/debug';
import { decoratorWithParams } from '@ember-decorators/utils/decorator';
import collapseProto from '@ember-decorators/utils/collapse-proto';

function collapseAndMerge(prototype, property, ...items) {
  collapseProto(prototype);

  if (property in prototype) {
    const parentElements = prototype[property];
    items.unshift(...parentElements)
  }

  prototype[property] = items;
}

/**
  Class decorator which specifies the local  class names to be applied to a
  component. This replaces the `localClassNames` property on components in the
  traditional Ember object model.

  ```js
  @localClassNames('a-static-class', 'another-static-class')
  export default class ClassNamesDemoComponent extends Component {}
  ```

  @param {...string} classNames - The list of local classes to be applied to the component
*/
export function localClassNames(...classNames) {
  assert(
    `The @localClassNames decorator must be provided strings, received: ${classNames}`,
    classNames.every(className => typeof className === 'string')
  );

  return klass => {
    collapseAndMerge(klass.prototype, 'localClassNames', ...classNames);
    return klass;
  };
}

/**
  Decorator which indicates that the field or computed should be bound to the
  component local class names. This replaces `localClassNameBindings` by
  directly allowing you to specify which properties should be bound.

  ```js
  export default class ClassNameDemoComponent extends Component {
    // Adds 'bound-field' class, if true
    @localClassName boundField = true;

    // With provided true/false class names
    @className('active', 'inactive') isActive = true;
  }
  ```
  @function
  @param {string} truthyName? - The local class to be applied if the value the
                                field is truthy, defaults to the name of the
                                field.
  @param {string} falsyName? - The class to be applied if the value of the field
                               is falsy.
*/
export const localClassName = decoratorWithParams(function(target, key, desc, params) {
  assert(
    `The @localClassName decorator may take up to two parameters, the truthy class and falsy class for the class binding. Received: ${params.length}`,
    params.length <= 2
  );
  assert(
    `The @localClassName decorator may only receive strings as parameters. Received: ${params}`,
    params.every(className => typeof className === 'string')
  );

  const binding = params.length > 0 ? `${key}:${params.join(':')}` : key;

  collapseAndMerge(target, 'localClassNameBindings', binding);

  if (desc) {
    // Decorated fields are currently not configurable in Babel for some reason, so ensure
    // that the field becomes configurable (else it messes with things)
    desc.configurable = true;
    desc.writable = true;
  }

  return desc;
});
