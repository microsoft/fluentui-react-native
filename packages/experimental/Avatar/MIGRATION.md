# Avatar Migration

## Migration from PersonaCoin component

### Component renames

| `PersonaCoin`                                    | `Avatar`                                                     |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `<Avatar size={24} initials="SN" />`             | `<PersonaCoin size='size24' initials="SN" />`                |
| `<Avatar size={24} initials="SN" />`             | `<PersonaCoin presence='available' coinColorFluent="red" />` |
| `<Avatar image={{source: './path/name.png'}} />` | `<PersonaCoin imageUrl="./path/name.png" />`                 |
| `<Avatar accessibilityLabel="Photo" />`          | `<PersonaCoin imageDescription="Photo" />`                   |

### Props that remain as is

- `icon`
- `initials`
- `size`

### Props no longer supported with an equivalent functionality in Avatar

- `coinColorFluent` => Use `avatarColor` instead.
- `imageUrl` => Images passes using `image` slot: `image={{ src: './image.jpg' }} />`.
- `imageDescription` => Use `accessibilityLabel` instead.
- `isOutOfOffice` => `outOfOffice` is part of `badge` slot. Use `badge={{ outOfOffice: true }} />`.
- `presence` => It's part of `badge` slot. Use `badge={{ presence: 'available' }} />`.
- `ring` => `ring` became part of `activeAppearance` prop. It's used together with `active='active'` prop.

### New props

- `active`
- `activeAppearance` - According to Web spec there should be `ring`, `shadow`, `glow`, `ring-shadow`, `ring-glow`.
  Currently we support only `ring`. `activeAppearance` can be used when `active` prop set to `active`.
- `name` - is used for generation initials with `getInitials` method.
- `shape` - can be `circular` and `square`.
- `idForColor`

### Tokens that remain as is

- Any props that are part of `IBackgroundColorTokens`, `IForegroundColorTokens`

- `iconSize`
- `iconWeight`
- `horizontalIconAlignment`
- `verticalIconAlignment`
- `size`

### Tokens no longer supported with an equivalent functionality in Avatar

- `initialsSize` => Use `fontSize` token instead
- `coinColorFluent` => Use `avatarColor` token instead
- `coinSize` => Use size tokens instead.
- `ring` => Use `ringBackgroundColor`, `ringColor`, `ringThickness` and `ringInnerGap`

### Tokens no longer supported without an equivalent functionality in Avatar

- `iconStrokeWidth` and `iconStrokeColor` => This was for activity ring around the Avatar.
  We support ring in `activeAppearance` prop. `borderColor` will be changed using `ringColor` token and `borderWidth` using ringThickness token.

### New tokens

- Any props that are part of `FontTokens` and `IBorderTokens`.
- `avatarOpacity`
- `badgeSize`
- `circular`
- `iconColor`
- `inactive`
- `square`

Size tokens:

- `size20`
- `size24`
- `size28`
- `size32`
- `size36`
- `size40`
- `size48`
- `size56`
- `size64`
- `size72`
- `size96`
- `size120`

Color tokens:

- `neutral`
- `brand`
- `darkRed`
- `cranberry`
- `red`
- `pumpkin`
- `peach`
- `marigold`
- `gold`
- `brass`
- `brown`
- `forest`
- `seafoam`
- `darkGreen`
- `lightTeal`
- `teal`
- `steel`
- `blue`
- `royalBlue`
- `cornflower`
- `navy`
- `lavender`
- `purple`
- `grape`
- `lilac`
- `pink`
- `magenta`
- `plum`
- `beige`
- `mink`
- `platinum`
- `anchor`

### Slots no longer supported with an equivalent functionality in v1 Avatar

- `photo` => Use `image` slot instead

### Slots no longer supported without an equivalent functionality in v1 Avatar

- `glow` => is not suported in this version of Avatar

### New slots

- `badge`

### Prop differences due to technical differences and limitations

- Web uses `image` slot which is part of `react-image` component. They use syntax `image={{ src: './MonaKane.jpg' }}`. If we use similar syntax, our users will need to write `image={{ source: { uri: './MonaKane.jpg' } }} />`. In majority of cases users pass image URL that's why we still have opportunity to pass this parameter using `src` prop. But there's also a way to pass `image` object similar to Web.

### Other Prop differences

- `avatarColor` => Web uses `color` prop and omits it from `ComponentProps<AvatarSlots>`. Their users can style font color using CSS but our users can style the component via tokens. If we use the same prop name (color), we'll need to omit it from foregroundTokens and come up with a new name for the font color prop. That's why we use `avatarColor` prop instead of `color`.

## Property mapping

| `PersonaCoin`      | `Avatar`             |
| ------------------ | -------------------- |
|                    | `active`             |
|                    | `activeAppearance`   |
|                    | `badge`              |
| `coinColorFluent`  | `avatarColor`        |
| `icon`             | `icon`               |
|                    | `idForColor`         |
| `imageUrl`         | `iamge`              |
| `imageDescription` | `accessibilityLabel` |
| `isOutOfOffice`    |                      |
| `initials`         | `initials`           |
|                    | `name`               |
| `presence`         |                      |
| `ring`             |                      |
|                    | `shape`              |
| `size`             | `size`               |
