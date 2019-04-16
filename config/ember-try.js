'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then((urls) => {
    return {
      useYarn: true,
      scenarios: [
        {
          name: 'ember-lts-2.16',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({ 'jquery-integration': true }),
          },
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.5.1',
              'ember-source': '~2.16.0'
            }
          }
        },
        {
          name: 'ember-lts-2.18',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({ 'jquery-integration': true }),
          },
          npm: {
            devDependencies: {
              '@ember/jquery': '^0.5.1',
              'ember-source': '~2.18.0'
            }
          }
        },
        {
          name: 'ember-release',
          npm: {
            devDependencies: {
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-beta',
          npm: {
            devDependencies: {
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-canary',
          npm: {
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-default',
          npm: {
            devDependencies: {}
          }
        },
        {
          name: 'babel-6',
          npm: {
            dependencies: {
              'ember-cli-babel': '^6',
            },
            devDependencies: {
              'ember-decorators-polyfill': null,
              '@ember-decorators/babel-transforms': '^2',
              '@ember-decorators/object': '^2',
              '@ember-decorators/component': '^2',
            }
          }
        },
        {
          // We test withs stage-1 decorators by default
          name: 'stage-2-decorators',
          npm: {
            dependencies: {
              'ember-cli-babel': '7.3.0',
            },
            devDependencies: {
              'ember-decorators-polyfill': null,
              '@ember-decorators/babel-transforms': '^5',
              '@ember-decorators/object': '^5',
              '@ember-decorators/component': '^5'
            }
          }
        }
      ]
    };
  });
};
