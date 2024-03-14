# Overflow

## Background

The `Overflow` and `OverflowItem` components, based off the same Fluent web v9 components of the same name, are low level utilities that enable users to create overflow experiences with any component. These components will detect and hide overflowing elements on screen and manage the overflow state.

## Documentation and Usage

Because this component is so new, expect multiple changes to the docs. More work must be done to align the APIs of Fluent web's `Overflow` and FURN's `Overflow` suite.

### Overflow

The `Overflow` component is the parent container of `OverflowItems` to be rendered.

Below is a list of props the `Overflow` supports.

```ts
export interface OverflowProps extends ViewProps {
  /**
   * Horizontal padding to add to the container
   */
  padding?: ViewStyle['padding'];
  /**
   * List of all IDs that will be rendered in the overflow container
   */
  itemIDs: string[];
  /**
   * By default, the overflow container's opacity is set to 0 while the overflow manager figures out which items should be hidden due to noticable pop-in.
   * This flag sets the opacity to always be visible.
   */
  dontHideBeforeReady?: boolean;
  /**
   * Callback triggering whenever the visibility of one or more items changes
   */
  onOverflowUpdate?: (data: OverflowUpdatePayload) => void;
}

interface OverflowUpdatePayload {
  visibleIds: string[];
  invisibleIds: string[];
}
```

Keep in mind that unlike the web equivalent, every item ID that will be rendered as an `OverflowItem` must be passed into the `itemIDs` prop. This is a consequence of how element measurements are taken on web (using the DOM) vs on native (using layout events).

While you can change padding of the Overflow using the `style` prop, it is better to use the `padding` prop above directly because only then will the padding measurement be factored into overflow calculations.

### OverflowItem

The `OverflowItem` component represents a single item that can be shown or hidden within the `Overflow` container.

Below is a list of props the `OverflowItem` supports.

```ts
export interface OverflowItemProps extends ViewProps {
  /** Unique ID assigned to the item */
  overflowID: string;
  /** Priority of item. Greater priority value means item will stay visible longer vs other items */
  priority?: number;
  /** Callback that runs whenever this item's visibility changes or whenever its dimensions should be manually set */
  onOverflowItemChange?: OverflowItemChangeHandler;
}
```

There are two things to note about FURN's `OverflowItem`.

1. The FURN `OverflowItem` has extra functionality that the web equivalent doesn't have. As of writing this, the FURN `Overflow` will always render one visible item, vs the web component which allows the customization of the minimum items shown. If the width of the container becomes smaller than the item, then the `Overflow` item will control the width of its child to make both the item and rendered menu fit into the container neatly. Customization of this behavior may come in the future.
2. The child of the `OverflowItem` must be able to accept and use a `style` prop and an `onLayout` prop to accomplish its ability to hide itself and change its width to fit within the `Overflow`. If the child cannot accept either, then the `Overflow` will not work as intended. If the child can accept both props, but functionality is broken, check if it is actually able to receive both `style` and `onLayout` props - props might not be passing correctly.

### useOverflowMenu

The `useOverflowMenu` hook is a utility hook that registers an overflow menu element within the entire overflow context. This must be used within the `Overflow` container for the component to work as intended.

The hook returns the following state below:

```ts
export interface OverflowMenuState {
  /** Flag for whether the menu should be showing */
  showMenu: boolean;
  /** Map of overflow items and their visibility in their menu - true means they should show as menu items */
  visibleMenuItems: string[];
  /** Component ref to attach to this OverflowMenu's trigger */
  menuTriggerRef: React.RefObject<View>;
  /** Callback for RN onLayout event */
  onMenuTriggerLayout: (e: LayoutChangeEvent) => void;
}
```

It is important to pass the `onMenuTriggerLayout` callback to your "menu trigger" that will be rendered inside `Overflow`. Otherwise, the container will not render or not work as intended.

The examples below will show this hook being used to populate the items of a [FURN `Menu`](../../components/Menu/SPEC.md), but the "overflow menu" can really be any React element / FURN component that can accept the layout callback from the hook.

### Usage and Examples

See the test page for

Below is an example of using the `useOverflowMenu` hook with a Menu component.

```tsx
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Menu, MenuTrigger, MenuList, MenuPopover, MenuItem } from '@fluentui-react-native/menu';
import { useOverflowMenu } from '@fluentui-react-native/overflow';

interface OverflowMenuProps extends ButtonProps {
  onItemPress: (id: string) => void;
}

export function OverflowMenu(props: OverflowMenuProps) {
  const { onItemPress, appearance = 'outline' } = props;
  const { showMenu, visibleMenuItems, menuTriggerRef, onMenuTriggerLayout } = useOverflowMenu();
  const overflowCount = visibleMenuItems.length;
  if (showMenu) {
    return (
      <Menu>
        <MenuTrigger>
          <Button
            accessibilityLabel="More options"
            onLayout={onMenuTriggerLayout}
            style={overflowTestPageStyles.menuTrigger}
            componentRef={menuTriggerRef}
          >
            {`+ ${overflowCount} item${visibleItems.length !== 1 ? 's' : ''}`}
          </Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {visibleMenuItems.map((id) => (
              <MenuItem onClick={() => onItemPress(id)} key={id}>
                {itemLabels[id]}
              </MenuItem>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    );
  } else {
    return null;
  }
}
```

With the Overflow Menu set, we can now use our custom component in a barebones Overflow experience below.

```tsx
import { Overflow, OverflowItem } from '@fluentui-react-native/overflow';

import { OverflowMenu } from '.';

const items = ['a', 'b', 'c', 'd'];
const itemLabels = {
  a: 'Item A',
  b: 'Item B',
  c: 'Item C',
  d: 'Item D',
};

function OverflowExperience() {
  return (
    <Overflow itemIDs={items}>
      {items.map((item) => (
        <OverflowItem key={item} overflowID={item}>
          <Button onClick={() => console.log(item)}>{itemLabels[item]}</Button>
        </OverflowItem>
      ))}
      <OverflowMenu onItemPress={console.log} />
    </Overflow>
  );
}
```

You can even integrate the `Overflow` and `OverflowItem` with existing FURN components, such as a TabList.

```tsx
import { TabList, Tab } from '@fluentui-react-native/tablist';

import { OverflowMenu } from '.';

const items = ['a', 'b', 'c', 'd'];
const itemLabels = {
  a: 'Item A',
  b: 'Item B',
  c: 'Item C',
  d: 'Item D',
};

function OverflowTabListExperience() {
  const [key, setKey] = React.useState('a');
  return (
    <Overflow itemIDs={items}>
      <TabList selectedKey={key} onTabSelect={setKey}>
        {items.map((item) => (
          <OverflowItem priority={key === item ? 2 : 1} key={item} overflowID={item}>
            <Tab tabKey={item}>{itemLabels[item]}</Tab>
          </OverflowItem>
        ))}
        <OverflowMenu appearance="subtle" onItemPress={setKey} />
      </TabList>
    </Overflow>
  );
}
```
