'use strict';

// Bundle @nestjs/* and rxjs so webpack resolves their ESM/CJS interop internally.
// Everything else stays external (loaded from node_modules at runtime).
function externals({ request }, callback) {
  const bundle = /^@nestjs\//.test(request) || /^rxjs/.test(request) || request === 'reflect-metadata';
  const relative = request.startsWith('.') || request.startsWith('/');
  if (bundle || relative) return callback();
  callback(null, 'commonjs ' + request);
}

module.exports = (options) => ({
  ...options,
  entry: { main: './src/server.ts' },
  externals: [externals],
  output: {
    ...options.output,
    libraryTarget: 'commonjs2',
  },
});
