/*jshint node:true*/
module.exports = {
  useVersionCompatibility: true,
  scenarios: [
    {
      name: 'ember-alpha',
      // Currently, alpha will fail due to https://github.com/babel/broccoli-babel-transpiler/issues/67
      allowedToFail: true,
      bower: {
        dependencies: {
          'ember': 'alpha',
        }
      }
    }
  ]
};
