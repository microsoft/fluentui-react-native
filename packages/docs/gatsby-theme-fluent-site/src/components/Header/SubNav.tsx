import * as React from 'react'
import styled from '@emotion/styled'
import { Link } from 'gatsby'

export const SubNav = props => {
  const menuItems = props.topLinks.map((item, index) => {
    return (
      <li key={index}>
        <Link partiallyActive={true} activeClassName="Link-IsActive" to={item.link}>
          {item.name}
        </Link>
      </li>
    )
  })

  return (
    <StyledSubNav>
      <StyledList>{menuItems}</StyledList>
    </StyledSubNav>
  )
}

const StyledSubNav = styled.div`
  background-color: #eee;
  margin: 0px;

  p {
    margin: 0;
    padding: 40px;
    opacity: 0.4;
  }
`

const StyledList = styled.ul`
  display: flex;
  padding: 30px 30px 30px 20px;
  max-width: 600px;
  list-style: none;

  li {
    list-style: none;
    margin: 0 20px;

    a {
      color: #666;
      font-weight: 500;
      text-decoration: none;

      &.Link-IsActive {
        color: #000;
      }
    }
  }
`
