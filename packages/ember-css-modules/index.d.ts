/**
  Decorator which indicates that the field or computed should be bound to the
  component local class names. This replaces `localClassNameBindings` by
  directly allowing you to specify which properties should be bound.

  ```js
  export default class ClassNameDemoComponent extends Component {
    // Adds 'bound-field' class, if true
    @localClassName boundField = true;

    // With provided true/false class names
    @localClassName('active', 'inactive') isActive = true;
  }
  ```
  @function
  @param {string} truthyName? - The local class to be applied if the value the
                                field is truthy, defaults to the name of the
                                field.
  @param {string} falsyName? - The class to be applied if the value of the field
                               is falsy.
 */
export function localClassName(
  truthyName?: string,
  falsyName?: string
): PropertyDecorator;

/**
  Class decorator which specifies the local class names to be applied to a
  component. This replaces the `localClassNames` property on components in the
  traditional Ember object model.

  ```js
  @localClassNames('a-static-class', 'another-static-class')
  export default class ClassNamesDemoComponent extends Component {}
  ```

  @param {...string} classNames - The list of local classes to be applied to the component
 */
export function localClassNames(...classNames: string[]): ClassDecorator;

