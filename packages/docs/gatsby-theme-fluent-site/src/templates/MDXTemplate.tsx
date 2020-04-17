import * as React from 'react'
import styled from '@emotion/styled'
import PageTemplate from './PageTemplate'

export default props => {
  return (
    <PageTemplate {...props}>
      {props.pathContext.frontmatter.titleCategory && <TitleCategory>{props.pathContext.frontmatter.titleCategory}</TitleCategory>}
      <h1>{props.pathContext.frontmatter.title}</h1>
      {props.children}
    </PageTemplate>
  )
}

const TitleCategory = styled.div`
  margin: -1em 0 -1em 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
`
