import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('testing', function() {
    this.route('classic-route');
    this.route('classic-template-only-route');
    this.route('pod-route');
    this.route('pod-template-only-route');

    this.route('render-component', { path: 'render-component/*component' });
  });
});

export default Router;
