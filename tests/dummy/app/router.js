import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('classic-route');
  this.route('classic-template-only-route');
  this.route('pod-route');
  this.route('pod-template-only-route');

  this.route('render-component', { path: 'render-component/*component' });
});

export default Router;
