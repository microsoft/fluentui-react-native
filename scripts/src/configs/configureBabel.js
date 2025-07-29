/** @typedef {{ esmodule?: boolean, estarget?: string, jsxRuntime?: boolean }} BabelConfigOptions */

/**
 * @param {BabelConfigOptions} options
 * @param {import('@babel/core').TransformOptions} [mixin] - Additional Babel configuration options to mix in.
 * @returns {import('@babel/core').TransformOptions} - The complete Babel configuration object.
 */
export function configureBabel(/** @type {BabelConfigOptions} */ options = {}, mixin = {}) {
  const { esmodule, jsxRuntime } = options;
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
    ...mixin,
  };
}
