import Ember from 'ember';
import Resolver from 'ember-resolver';

import ComponentMixin from './mixins/component-mixin';
import ControllerMixin from './mixins/controller-mixin';
import ComponentLookupMixin from './mixins/component-lookup-mixin';
import ResolverMixin from './mixins/resolver-mixin';

Ember.Component.reopen(ComponentMixin);
Ember.Controller.reopen(ControllerMixin);
Ember.ComponentLookup.reopen(ComponentLookupMixin);
Resolver.reopen(ResolverMixin);
