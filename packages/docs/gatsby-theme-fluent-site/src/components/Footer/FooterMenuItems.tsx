import * as React from 'react'
import styled from '@emotion/styled'
import { Link } from 'gatsby'

export const FooterMenuItems = props => {
  return (
    <StyledMenuItems>
      {props.footerLinks.map((link, idx) => (
        <MenuItem {...link} key={'footerItem_' + idx} />
      ))}
    </StyledMenuItems>
  )
}

const MenuItem = props => {
  return (
    <StyledMenuItem key={props.name}>
      {props.link.startsWith('http') ? (
        <a
          href={props.link}
          target={props.target !== undefined ? props.target : undefined}
          {...{ 'aria-label': props.ariaLabel ? props.ariaLabel : undefined }}
        >
          {props.name}
        </a>
      ) : (
        <Link
          activeClassName="Link-IsActive"
          to={props.link}
          target={props.target ? props.target : undefined}
          {...{ 'aria-label': props.ariaLabel ? props.ariaLabel : undefined }}
        >
          {props.name}
        </Link>
      )}
    </StyledMenuItem>
  )
}

const StyledMenuItems = styled.ul`
  display: flex;
  padding: 0;
`

const StyledMenuItem = styled.li`
  list-style: none;
  margin: auto 10px;

  a {
    color: #000;
    opacity: 0.7;
    padding: 0 2px;
    text-decoration: none;

    &.Link-IsActive {
      border-bottom: 3px solid #000;
      padding-bottom: 20px;
      font-weight: 600;
      opacity: 1;
    }
  }
`
