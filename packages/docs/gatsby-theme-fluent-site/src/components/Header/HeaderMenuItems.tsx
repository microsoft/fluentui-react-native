import * as React from 'react'
import styled from '@emotion/styled'
import { Link } from 'gatsby'

const MenuItem = props => {
  return (
    <StyledMenuItem key={props.name}>
      <Link activeClassName="Link-IsActive" to={props.link}>
        {props.name}
      </Link>
    </StyledMenuItem>
  )
}

export const HeaderMenuItems = props => {
  return (
    <StyledMenuItems>
      {props.headerLinks.map((link, i) => (
        <MenuItem key={i} {...link} />
      ))}
    </StyledMenuItems>
  )
}

const StyledMenuItems = styled.ul`
  display: flex;
  padding: 0;
`

const StyledMenuItem = styled.li`
  list-style: none;
  margin: auto 10px;

  &:first-of-type {
    border-right: 1px solid #eee;
    padding-right: 20px;
  }

  a {
    color: #666;
    padding: 0 2px;
    font-weight: 500;
    text-decoration: none;

    &.Link-IsActive {
      color: #000;
      font-weight: 500;
      position: relative;

      &:after {
        content: '';
        position: absolute;
        bottom: -35px;
        left: calc(50% - 10px);
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 10px 10px 10px;
        border-color: transparent transparent #eeeeee transparent;
      }
    }
  }
`
