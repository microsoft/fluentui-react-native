import * as React from 'react';
import styled from '@emotion/styled';
import { Link } from 'gatsby';
import { usePageContext } from '../Provider';

const Menu = props => {
  const { items, level = 0 } = props;
  const menuItems = items.map((item, index) => {
    if (!item.link && !item.items) {
      return;
    }

    if (item.link && item.link.charAt(0) !== '/') {
      item.link = '/' + item.link;
    }

    return (
      <li key={index} style={{ marginLeft: 16 * level + 'px', marginBottom: 4 }}>
        {item.link ? <Link to={item.link}>{item.name}</Link> : <span> {item.name}</span>}
        {item.items && <Menu items={item.items} level={level + 1} />}
      </li>
    );
  });
  return <StyledList>{menuItems}</StyledList>;
};

export const Sidebar = props => {
  const {
    pathContext: { toc = [] }
  } = usePageContext();

  return (
    <StyledSidebar>
      <Menu items={toc} />
    </StyledSidebar>
  );
};
const HeaderHeight = 69;
const FooterHeight = 162;

const StyledSidebar = styled.div`
  width: 300px;
  padding: 40px;
  background-color: rgba(0, 0, 0, 0.01);
  height: calc(100vh - ${HeaderHeight}px - ${FooterHeight}px);
  flex: none;
`;

const StyledList = styled.ul`
  margin: 0px;
  padding: 0px;

  li {
    margin: 0px 0px 20px;
    padding: 0px;
    list-style: none;

    a {
      color: #323130;
      font-weight: 500;
      text-decoration: none;
    }
  }
`;
