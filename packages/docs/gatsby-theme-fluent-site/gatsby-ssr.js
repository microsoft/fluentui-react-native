import { Stylesheet, InjectionMode } from '@uifabric/merge-styles'
import { renderStatic } from '@uifabric/merge-styles/lib/server'
import { renderToString } from 'react-dom/server'
import React from 'react'

const config = require('./gatsby-config')

export const replaceRenderer = ({ bodyComponent, replaceBodyHTMLString, setHeadComponents }) => {
  const { html, css } = renderStatic(() => {
    return renderToString(bodyComponent)
  })

  replaceBodyHTMLString(html)

  setHeadComponents([<style dangerouslySetInnerHTML={{ __html: css }} />])
}

export const onRenderBody = ({ pathname, setHeadComponents }) => {
  setHeadComponents([<link rel="canonical" href={`${config.siteMetadata ? config.siteMetadata.siteUrl : '/'}${pathname}`} />])
}
