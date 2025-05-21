const { localClassRegistryPlugin } = require('glimmer-local-class-transform');

module.exports = {
  name: 'ember-local-class',
  setupPreprocessorRegistry(type, registry) {
    if (type === 'parent') {
      let options = (this.app ?? this.parent).options?.['ember-local-class'] ?? {};
      let runtimeModule = 'ember-local-class/-runtime';
      let extension = options.extension ?? '.module.css';
      let pathMapping = options.pathMapping ?? {
        '/template\\.hbs$': `/styles${extension}`,
        '/templates/(.*/)?(.*)\\.hbs$': `/styles/$1$2${extension}`,
        '(\\.g?[tj]s|\\.hbs)+$': extension,
      };

      registry.add(
        'htmlbars-ast-plugin',
        localClassRegistryPlugin({ runtimeModule, pathMapping })
      );
    }
  }
}
