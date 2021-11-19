import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('testing', function () {
    this.route('classic-route');
    this.route('classic-template-only-route');
    this.route('pod-route');
    this.route('pod-template-only-route');
  });
});
