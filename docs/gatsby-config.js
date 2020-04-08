module.exports = {
  siteMetadata: {
    siteURL: 'https://fluentui.z5.web.core.windows.net/',
  },
  plugins: [
    `gatsby-plugin-typescript`,
    `gatsby-plugin-sharp`,
    'gatsby-transformer-sharp',
    {
      resolve: `gatsby-theme-fluent-site`,
      options: {
        contentPath: `./content`,
      },
    },
  ],
};
