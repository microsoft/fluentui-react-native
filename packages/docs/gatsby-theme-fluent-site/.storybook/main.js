const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  stories: ['../src/**/*.story.tsx'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links'],
  webpackFinal: async config => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: require.resolve('babel-loader'),
      options: {
        presets: [['react-app', { flow: false, typescript: true }]],
      },
    })

    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ['typescript'],
      })
    )
    config.resolve.extensions.push('.ts', '.tsx')
    return config
  },
}
