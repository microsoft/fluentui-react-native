import * as renderer from 'react-test-renderer';

import type { MenuButtonItemProps } from '..';
import { MenuButton } from '..';

it('ContextualMenu default', () => {
  const menuItems: MenuButtonItemProps[] = [
    {
      itemKey: '1',
      text: 'MenuItem 1',
    },
    {
      itemKey: '2',
      text: 'MenuItem 2',
    },
    {
      itemKey: '3',
      text: 'Disabled Menu Item',
      disabled: true,
    },
    {
      hasSubmenu: true,
      itemKey: '4',
      text: 'SubmenuItem',
      submenuItems: [
        {
          text: 'SubmenuItem',
          itemKey: '1',
        },
        {
          itemKey: '2',
          text: 'SubmenuItem 2',
          disabled: true,
        },
        {
          itemKey: '3',
          text: 'SubmenuItem 3',
        },
      ],
    },
    {
      itemKey: '5',
      text: 'Menu Item',
    },
  ];
  const tree = renderer.create(<MenuButton menuItems={menuItems}>Press for Nested MenuButton</MenuButton>).toJSON();
  expect(tree).toMatchSnapshot();
});
