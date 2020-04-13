import * as React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import styled from '@emotion/styled'
import { FooterMenuItems } from './FooterMenuItems'

export const Footer = props => {
  const data = useStaticQuery(graphql`
    query FooterMenuQuery {
      site {
        siteMetadata {
          footerLinks {
            name
            link
            target
            ariaLabel
          }
        }
      }
    }
  `)

  const {
    site: { siteMetadata },
  } = data
  return (
    <StyledFooter>
      <FooterMenuItems {...siteMetadata} />
    </StyledFooter>
  )
}

const StyledFooter = styled.div`
  display: flex;
  margin: 0 auto;
  padding: 40px 40px 40px 20px;
  border-top: 1px solid #eee;
`
