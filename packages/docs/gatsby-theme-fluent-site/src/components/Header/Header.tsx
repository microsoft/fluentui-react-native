import * as React from 'react'
import styled from '@emotion/styled'
import { useStaticQuery, graphql, Link } from 'gatsby'
import { HeaderMenuItems } from '.'
import { Search } from '../Search'
import { SubNav } from './SubNav'
import { usePageContext } from '../Provider'

export const Header = props => {
  const pageContext = usePageContext()
  const data = useStaticQuery(graphql`
    query MainMenuQuery {
      site {
        siteMetadata {
          title
          headerLinks {
            name
            link
          }
          topLinks {
            link
            name
          }
        }
      }
    }
  `)

  const {
    pathContext: { rootPath },
    location: { pathname },
  } = pageContext

  const {
    site: { siteMetadata },
  } = data

  const topLinks = siteMetadata.topLinks.map(item => {
    return {
      name: item.name,
      link: '/' + rootPath + '/' + item.link,
    }
  })

  return (
    <StyledHeader>
      <Nav>
        <Logo to="/">
          <img src={require('gatsby-theme-fluent-site/static/images/microsoft.svg')} alt="Microsoft Logo" />
          <p>Fluent</p>
        </Logo>
        <HeaderMenuItems {...siteMetadata} />
        <Search />
      </Nav>
      {rootPath && rootPath !== 'fundamentals' && <SubNav topLinks={topLinks} />}
    </StyledHeader>
  )
}

const StyledHeader = styled.div``

const Nav = styled.header`
  width: 100%;
  padding: 20px 40px;

  display: flex;
  justify-content: space-between;

  border-bottom: 1px solid #eee;
`

const Logo = styled(Link)`
  display: flex;

  color: #000;
  text-decoration: none;

  img {
    width: 22px;
  }
  p {
    margin: 12px;
    font-weight: 600;
  }
`
