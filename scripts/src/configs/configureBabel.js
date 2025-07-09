/** @typedef {{ esmodule?: boolean, estarget?: string, jsxRuntime?: boolean }} BabelConfigOptions */

/**
 * @param {BabelConfigOptions} options
 * @param {import('@babel/core').TransformOptions} [mixin] - Additional Babel configuration options to mix in.
 * @returns {import('@babel/core').TransformOptions} - The complete Babel configuration object.
 */
module.exports.configureBabel = function (/** @type {BabelConfigOptions} */ options = {}, mixin = {}) {
  const { esmodule, estarget, jsxRuntime } = options;
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: esmodule ? false : 'auto',
          targets: { node: 'current' },
        },
      ],
      '@babel/preset-react',
      '@babel/preset-typescript',
      ['module:@react-native/babel-preset', { runtime: jsxRuntime ? 'automatic' : 'classic' }],
    ],
    plugins: [
      ['@babel/plugin-proposal-private-property-in-object', { loose: false }],
      ['@babel/plugin-proposal-class-properties', { loose: false }],
      ['@babel/plugin-transform-private-methods', { loose: false }],
    ],
    ...mixin,
  };
};
