const path = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions
}

exports.createPages = async ({ actions, graphql }) => {
  const { createPage } = actions
}

exports.onCreateWebpackConfig = ({ stage, actions }) => {
  if (stage.startsWith('develop')) {
    actions.setWebpackConfig({
      resolve: {
        alias: {
          'react-dom': '@hot-loader/react-dom',
        },
      },
    })
  }
  actions.setWebpackConfig({
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['typescript'],
      }),
    ],
  })
}
