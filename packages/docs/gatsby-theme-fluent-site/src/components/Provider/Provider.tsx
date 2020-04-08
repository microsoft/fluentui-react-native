import * as React from 'react'
import { MDXProvider } from '@mdx-js/react'
import { Highlight, HighlightInline } from '../Highlight'
import { Global, css } from '@emotion/core'

export const Provider = props => (
  <MDXProvider
    components={{
      code: Highlight,
      inlineCode: HighlightInline,
    }}
  >
    <Global
      styles={css`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }
        html,
        body,
        #gatsby-focus-wrapper,
        #___gatsby {
          height: 100%;
          min-height: 100%;
          font-family: 'Segoe UI';
        }
        body,
        ul[class],
        ol[class],
        li,
        figure,
        figcaption,
        blockquote,
        dl,
        dd {
          margin: 0;
        }
        input,
        button,
        textarea,
        select {
          font: inherit;
        }
        img {
          max-width: 100%;
          display: block;
        }
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
            'Segoe UI Emoji', 'Segoe UI Symbol';
          background: #fff;
        }
        h1,
        h2,
        h3 {
          font-weight: 600;
        }
      `}
    />
    {props.children}
  </MDXProvider>
)
