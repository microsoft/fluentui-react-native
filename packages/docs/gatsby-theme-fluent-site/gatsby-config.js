require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})
module.exports = themeOptions => {
  const { contentPath, pathPrefix } = themeOptions
  return {
    pathPrefix: pathPrefix || '',
    siteMetadata: {
      title: 'Microsoft Design - Fluent',
      description:
        'Fluent brings the fundamentals of principled design, innovation in technology, and customer needs together as one. It’s a collective approach to creating simplicity and coherence through a shared, open design system across platforms.',
      siteURL: 'https://fluentui.z5.web.core.windows.net/',
      headerLinks: [
        {
          name: 'Fundamentals',
          link: '/fundamentals',
          headerOnly: true,
        },
        {
          name: 'Web',
          link: '/web',
        },
        {
          name: 'Windows',
          link: '/windows',
        },
        {
          name: 'iOS',
          link: '/ios',
        },
        {
          name: 'Android',
          link: '/android',
        },
        {
          name: 'Mac',
          link: '/mac',
        },
      ],
      topLinks: [
        { name: 'Get started', link: 'get-started' },
        { name: 'Styles & Theming', link: 'styles' },
        { name: 'Experiences', link: 'experiences' },
        { name: 'Components', link: 'components' },
      ],
      footerLinks: [
        {
          name: 'Resources',
          link: '/resources',
          ariaLabel: 'This link will take you to the Resources page',
        },
        {
          name: "What's new",
          link: '/whatsnew',
          ariaLabel: "This link will take you to the What's new page",
        },
        {
          name: 'GitHub',
          link: 'https://github.com/microsoft/fluent-site',
          target: '_blank',
          ariaLabel: 'This link will take you to the Microsoft Fluent UI GitHub site in a new window.',
        },
        {
          name: 'Privacy & cookies',
          link: 'https://privacy.microsoft.com/en-us/privacystatement',
          ariaLabel: 'This link will take you to the Microsoft privacy statement.',
        },
      ],
      homePageData: {
        news: [
          {
            title: 'Lorem ipsum dolor sit amet, consectet adipiscing elit. Vivamus ut max  velit, ut iaculis est. Nullam tincidunt.',
            link: '#',
          },
          {
            title: 'Lorem ipsum dolor sit amet, consectet adipiscing elit. Vivamus ut max  velit, ut iaculis est. Nullam tincidunt.',
            link: '#',
          },
          {
            title: 'Lorem ipsum dolor sit amet, consectet adipiscing elit. Vivamus ut max  velit, ut iaculis est. Nullam tincidunt.',
            link: '#',
          },
          {
            title: 'Lorem ipsum dolor sit amet, consectet adipiscing elit. Vivamus ut max  velit, ut iaculis est. Nullam tincidunt.',
            link: '#',
          },
        ],
      },
    },
    plugins: [
      `gatsby-plugin-emotion`,
      `gatsby-transformer-yaml`,
      `gatsby-plugin-react-helmet`,
      `gatsby-plugin-typescript`,
      'gatsby-plugin-sharp',
      'gatsby-transformer-sharp',
      `gatsby-plugin-offline`,
      {
        resolve: `gatsby-plugin-netlify-cms`,
        options: {
          modulePath: `${__dirname}/src/cms/cms.js`,
        },
      },
      {
        resolve: `gatsby-plugin-manifest`,
        options: {
          name: `Fabric Website 2.0`,
          short_name: `fabricwebsite`,
          start_url: `/`,
          background_color: `#f7f0eb`,
          theme_color: `#a2466c`,
          display: `standalone`,
        },
      },
      {
        resolve: `gatsby-plugin-mdx`,
        options: {
          defaultLayouts: {
            default: require.resolve('./src/templates/MDXTemplate.tsx'),
          },
          gatsbyRemarkPlugins: [
            {
              resolve: `gatsby-remark-images`,
              options: {
                maxWidth: 400,
                withWebp: true,
                tracedSVG: true,
                linkImagesToOriginal: false,
              },
            },
            {
              resolve: `gatsby-remark-copy-linked-files`,
            },
          ],
        },
      },
      {
        resolve: `gatsby-plugin-docs-creator`,
        options: {
          path: contentPath,
        },
      },
    ],
  }
}
