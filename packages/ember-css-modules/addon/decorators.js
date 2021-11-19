/*
  The implementation of these decorators is based on the original work of the
  ember-osf-web project, released under the Apache License 2.0:

  https://github.com/CenterForOpenScience/ember-osf-web/blob/4675920c4d53e60c62eed7a87ea84e0f4c5ab018/app/decorators/css-modules.ts
*/

import { get } from '@ember/object';
import { assert } from '@ember/debug';

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
export const localClassNames =
  (...classNames) =>
  (...desc) => {
    assert(
      `The @localClassNames decorator must be provided strings, received: ${classNames}`,
      classNames.every((className) => typeof className === 'string')
    );

    if (isStage1ClassDescriptor(desc)) {
      collapseAndMerge(desc[0].prototype, 'localClassNames', ...classNames);
    } else {
      desc[0].finisher = (target) => {
        collapseAndMerge(target.prototype, 'localClassNames', ...classNames);
      };
    }
  };

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
export const localClassName = (...params) => {
  if (isFieldDescriptor(params)) {
    return localClassName()(...params);
  }

  return (...desc) => {
    assert(
      `The @localClassName decorator may only receive strings as parameters. Received: ${params}`,
      params.every((className) => typeof className === 'string')
    );

    if (isStage1FieldDescriptor(desc)) {
      let [prototype, key, descriptor] = desc;
      setUpLocalClassField(params, prototype, key, descriptor);
    } else if (isStage2FieldDescriptor(desc)) {
      desc[0].finisher = (target) => {
        const { key, descriptor } = desc[0];
        setUpLocalClassField(params, target.prototype, key, descriptor);
      };
    }
  };
};

function setUpLocalClassField(params, prototype, key, descriptor) {
  const binding = params.length > 0 ? `${key}:${params.join(':')}` : key;

  collapseAndMerge(prototype, 'localClassNameBindings', binding);

  if (descriptor) {
    // Decorated fields are currently not configurable in Babel for some reason, so ensure
    // that the field becomes configurable (else it messes with things)
    descriptor.configurable = true;

    // Decorated fields which don't have a getter or setter, but also no
    // explicit `writable` flag, default to not being writable in Babel. Since
    // by default fields _are_ writable and this decorator should not change
    // that, we enable the `writable` flag in this specific case.
    if (
      !('get' in descriptor || 'set' in descriptor || 'writable' in descriptor)
    ) {
      descriptor.writable = true;
    }

    // Babel 6 provides a `null` initializer if one isn't set, but that can wind up
    // overwriting passed-in values if they're specified.
    // This is a no-op in Babel 7 (since `initializer` isn't part of the property descriptor)
    // and can be dropped when we remove support for Babel 6
    if (descriptor.initializer === null) {
      descriptor.initializer = function () {
        return get(this, key);
      };
    }
  }
}

function collapseAndMerge(prototype, property, ...items) {
  collapseProto(prototype);

  if (property in prototype) {
    const parentElements = prototype[property];
    items.unshift(...parentElements);
  }

  prototype[property] = items;
}

// These utilities are from @ember-decorators/utils
// https://github.com/ember-decorators/ember-decorators/blob/f3e3d636a38d99992af326a1012d69bf10a2cb4c/packages/utils/addon/-private/class-field-descriptor.js

function isStage1ClassDescriptor(possibleDesc) {
  let [target] = possibleDesc;

  return (
    possibleDesc.length === 1 &&
    typeof target === 'function' &&
    'prototype' in target &&
    !target.__isComputedDecorator
  );
}

function isFieldDescriptor(possibleDesc) {
  return (
    isStage1FieldDescriptor(possibleDesc) ||
    isStage2FieldDescriptor(possibleDesc)
  );
}

function isStage2FieldDescriptor(possibleDesc) {
  return possibleDesc && possibleDesc.toString() === '[object Descriptor]';
}

function isStage1FieldDescriptor(possibleDesc) {
  let [target, key, desc] = possibleDesc;

  return (
    possibleDesc.length === 3 &&
    typeof target === 'object' &&
    target !== null &&
    typeof key === 'string' &&
    ((typeof desc === 'object' &&
      desc !== null &&
      'enumerable' in desc &&
      'configurable' in desc) ||
      desc === undefined) // TS compatibility
  );
}

function collapseProto(target) {
  // We must collapse the superclass prototype to make sure that the `actions`
  // object will exist. Since collapsing doesn't generally happen until a class is
  // instantiated, we have to do it manually.
  if (typeof target.constructor.proto === 'function') {
    target.constructor.proto();
  }
}
