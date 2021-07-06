import * as React from 'react';
import { ContextualMenuItemProps } from '@fluentui/react-native';
import { MenuButton } from '..';
import * as renderer from 'react-test-renderer';

it('ContextualMenu default props', () => {
  const menuItems: ContextualMenuItemProps[] = [
    {
      itemKey: '1',
      text: 'MenuItem 1'
    },
    {
      itemKey: '2',
      text: 'MenuItem 2'
    },
    {
      itemKey: '3',
      text: 'MenuItem 3',
      disabled: true
    }
  ]
  const tree = renderer.create(<MenuButton content="Standard MenuButton" menuItems={menuItems} />).toJSON();
  expect(tree).toMatchSnapshot();
});
