# Menu Migration

## Migration from Context Menu

### Component rename

`ContextalMenu` and `Submenu` are now named `Menu`. `ContextualMenuItem` and `SubmenuItem` are now named `MenuItem`.

### Structural difference

The v1 `Menu` differs from the v0 `ContextualMenu` by wrapping the anchor component. With this, the `Menu` component takes care of several aspects of managing the menu, including the ref of the target and anchoring the popover (or callout) to the correct component, and open and close behavior.

Additionally there is no difference between the root menu and submenus in terms of how they are written. Both controls use the same components with the V1 `Menu`.

In v0 a `ContextualMenu` looked like:

```tsx
const stdBtnRef = React.useRef(null);
const [showContextualMenu, setShowContextualMenu] = React.useState(false);
const toggleShowContextualMenu = React.useCallback(() => {
  setShowContextualMenu(!showContextualMenu);
}, [showContextualMenu, setShowContextualMenu]);
const onDismissContextualMenu = React.useCallback(() => {
  setShowContextualMenu(false);
}, [setShowContextualMenu]);
const onItemClick = React.useCallback(
  (key) => {
    // Do something
  },
  [setLastMenuItemClicked],
);

<>
  <Button onClick={toggleShowContextualMenu} componentRef={stdBtnRef}>
    Press for ContextualMenu
  </Button>;
  {
    showContextualMenu && (
      <ContextualMenu
        target={stdBtnRef}
        onDismiss={onDismissContextualMenu}
        onItemClick={onItemClick}
        setShowMenu={toggleShowContextualMenu}
      >
        <ContextualMenuItem text="MenuItem 1" itemKey="1" />
        <ContextualMenuItem text="MenuItem 2" itemKey="2" />
        <ContextualMenuItem text="Disabled Menu Item" itemKey="3" disabled />
        <ContextualMenuItem text="MenuItem 4" itemKey="4" />
        <ContextualMenuItem text="MenuItem 5" itemKey="5" />
      </ContextualMenu>
    );
  }
</>
```

While a similar setup with the V1 `Menu` looks like:

```tsx
const onOption1Click = React.useCallback(
  () => {
    // Do something
  },
  [setLastMenuItemClicked],
);

<Menu>
  <MenuTrigger>
    <Button>Press for Menu</Button>
  </MenuTrigger>
  <MenuPopover>
    <MenuList>
      <MenuItem onClick={onOption1Click}>Option 1</MenuItem>
      <MenuItem>Option 2</MenuItem>
      <MenuItem disabled>Disabled Menu Item</MenuItem>
      <MenuItem>Option 4</MenuItem>
      <MenuItem>Option 5</MenuItem>
    </MenuList>
  </MenuPopover>
<Menu>
```

Mapping the `ContextualMenu` to the `Menu`:

1. The `Menu` component wraps both the trigger or the anchor and the popover, while the `ContextualMenu` only represented the popover. This allows the `Menu` to share state between the anchor and the popover.
2. The `MenuTrigger` component wraps the anchor. This allows for the anchor to be configured to open and close the popover and have the correct ref while providing flexibility for what the anchor component could be. There is no equivalent in the `ContextualMenu`.
3. The `MenuPopover` wraps the popover or callout component which hosts the options of the menu. This can be thought of as equivalent to `ContextualMenu`.
4. The `MenuList` wraps the menu options so that they can share state between each other and sets up the menu to be able to be a standalone component in the future. This can be thought of as handling some of the logic of the `ContextualMenu`.
5. The `MenuItem`, `MenuItemCheckbox`, and `MenuItemRadio` represent options in a menu. These can be thought of as equivalent to `ContextualMenuItem`.

#### Submenu

In v0 a `ContextualMenu` with a `Submenu` looked like:

```tsx
const stdBtnRef = React.useRef(null);
const [showContextualMenu, setShowContextualMenu] = React.useState(false);
const toggleShowContextualMenu = React.useCallback(() => {
  setShowContextualMenu(!showContextualMenu);
}, [showContextualMenu, setShowContextualMenu]);
const onDismissContextualMenu = React.useCallback(() => {
  setShowContextualMenu(false);
}, [setShowContextualMenu]);
const onItemClick = React.useCallback(
  (key) => {
    // Do something
  },
  [setLastMenuItemClicked],
);

const stdMenuItemRef = React.useRef(null);

const [showSubmenu, setShowSubmenu] = React.useState(false);

const toggleShowSubmenu = React.useCallback(() => {
  setShowSubmenu(!showSubmenu);
}, [showSubmenu, isSubmenuVisible, setShowSubmenu, setIsSubmenuVisible]);
const onDismissSubmenu = React.useCallback(() => {
  setShowSubmenu(false);
}, [setShowSubmenu]);
const onClick = React.useCallback(() => {
  console.log('submenu item clicked');
}, []);

<>
  <Button onClick={toggleShowContextualMenu} componentRef={stdBtnRef}>
    Press for ContextualMenu
  </Button>
  {showContextualMenu && (
    <ContextualMenu target={stdBtnRef} onDismiss={onDismissContextualMenu} setShowMenu={toggleShowContextualMenu}>
      <ContextualMenuItem text="Menu item 1" itemKey="1" />
      <ContextualMenuItem text="Menu item 2" itemKey="2" />
      <ContextualMenuItem text="Disabled Menu Item" itemKey="3" disabled />
      <SubmenuItem text="Nested Menu" itemKey="4" onHoverIn={toggleShowSubmenu} componentRef={stdMenuItemRef} />
      {showSubmenu && (
        <Submenu target={stdMenuItemRef} onDismiss={onDismissSubmenu} setShowMenu={toggleShowSubmenu}>
          <ContextualMenuItem text="SubmenuItem 1" itemKey="1" onClick={onClick} />
          <ContextualMenuItem text="SubmenuItem 2" itemKey="2" />
          <ContextualMenuItem text="Disabled Menu Item" itemKey="3" disabled />
        </Submenu>
      )}
      <ContextualMenuItem text="Menuitem 5" itemKey="5" />
    </ContextualMenu>
  )}
</>;
```

While a similar setup with the V1 `Menu` looks like:

```tsx
const onSubmenuItemClick = React.useCallback(
  () => {
    // Do something
  },
  [setLastMenuItemClicked],
);

<Menu>
  <MenuTrigger>
    <Button>Press for Menu</Button>
  </MenuTrigger>
  <MenuPopover>
    <MenuList>
      <MenuItem>Menu item 1</MenuItem>
      <MenuItem>Menu item 2</MenuItem>
      <MenuItem disabled>Disabled Menu Item</MenuItem>
      <Menu>
        <MenuTrigger>
          <MenuItem>Nested Menu</MenuItem>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem onClick={onSubmenuItemClick}>SubmenuItem 1</MenuItem>
            <MenuItem >SubmenuItem 2</MenuItem>
            <MenuItem disabled>Disabled Menu Item</MenuItem>
          </MenuList>
        </MenuPopover>
      <MenuItem>Menu item 5</MenuItem>
    </MenuList>
  </MenuPopover>
<Menu>
```

There is no separate `SubmenuItem` or `Submenu` component. You can wrap a `MenuItem` in a `Menu` component, and it will take care of showing an indicator for the submenu and opening the menu in a reasonable direction.

### Props no longer supported in ContextualMenu with an equivalent functionality in v1 Menu

- `content` => Pass the content as `children` instead
- `endIcon` => Use `after` value for `iconPosition` prop and pass icon information into `icon` prop instead
- `startIcon` => Use `before` value for `iconPosition` prop and pass icon information into `icon` prop instead

### Props no longer supported in ContextualMenu without an equivalent functionality in v1 Menu

- Cannot use both `startIcon` and `endIcon` at the same time in v1

### Tokens that remain as is

- Any props that are part of `FontTokens`, `IForegroundColorTokens`, `IBackgroundColorTokens`, `IBorderTokens`

### Tokens no longer supported with an equivalent functionality in v1 Menu

- `contentPadding` => Set on `style` property of `root` property under `slotProps` in `compose` API
- `iconColorHovered` => Use `iconColor` token under the `hovered` state token
- `iconColorPressed` => Use `iconColor` token under the `pressed` state token

### Tokens no longer supported without an equivalent functionality in v1 Menu

- `contentPaddingFocused` => Removed in favor of using native based focus visuals
- `wrapperBorderColor` => Removed in favor of using native based focus visuals

### Slots no longer supported with an equivalent functionality in v1 Menu

- `borderWrapper` has been removed in favor of using native focus visuals. Use `root` instead.
- `stack` has been removed. Use `root` instead.

### Updating ThemeProvider

If you are using the older theme provider `ThemeProvider` from `@uifabricshared/theming-react-native`, you will need to update the `ThemeProvider` to pull from `@fluentui-react-native/theme` to have the control work properly with themes. Please see [this page](../../../docs/pages/Guides/UpdateThemeProvider.md) for guidance.

### Migrating customized ContextalMenus

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

### Migrating composed ContextalMenus

Please see [this page](../../../docs/pages/Guides/UpdatingCustomize.md) for guidance on how to move from the old `customize` API to the new one.

## Porting from FluentUI v9 Menu

The FURN menu cannot be used in place of a FluentUI menu - these componentss are intended to be used on their respective platforms. See [this porting guide](../../../docs/pages/Guides/PortingFromFluentUI.md) for general guidance on coming from FluentUI to FURN.

### Not yet implemented

- Icons on MenuItems
- Secondary labels on MenuItems
- Split buttons for MenuItems
- MenuGroups (including headings)
- Scrollable menus
- Custom triggers for Menus (i.e. have a Menu trigger be a component that is not under MenuTrigger)
- Standalone MenuList

### Props that remain as is

- `children`
- `disabled`
- `icon`
- `onClick`
- `testID`
- `tooltip`

### Props renamed to align with ReactNative

No `Button` specific renames.

### Prop differences due to technical differences and limitations

- `icon` takes in a props object instead of the JSX element itself. This is due to framework differences from FluentUI.
- `iconOnly` must be supplied for components do not have any text content for them to be styled correctly. This is due to framework differences from FluentUI.
- `ref` is exposed as `componentRef`, similar to previous versions of FluentUI. This is due to framework differences from FluentUI.

### Other Prop differences

- `appearance` does not include values for `transparent` or `outline` as neither currently are used by native platforms.
- `iconPosition` uses `before` and `after` as values instead of `left` and `right` for better right to left support.
