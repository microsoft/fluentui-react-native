# Avatar

## Background

The Avatar component represents a person or entity. It displays the person's image, initials, or an icon, and can be either circular or square.
Previously it was a component PersonaCoin which used an old version of framework. There are more details in MIGRATION.md.

```ts
import { JSAvatar } from '@fluentui-react-native/experimental-avatar';
```

## Sample Code

Basic examples:

```jsx
  <JSAvatar />
  <JSAvatar icon={{ svgSource: { uri: 'https://www.example.com/test.svg', viewBox: '0 0 100 100' } }} size={120} />
  <JSAvatar src="../../path-to-image.png" active="active" activeAppearance="ring" size={56} />
  <JSAvatar shape="square" avatarColor="purple" name="Richard Feynman" />
```

More examples on the [Test pages for the Avatar](../../../apps/fluent-tester/src/FluentTester/TestComponents/Avatar). Instructions on running the tester app can be found [here](../../../apps/fluent-tester/README.md).

## Variants

### Active

Optional activity indicator.
Active prop can be `unset`, `active` and `inactive`. Default is `unset`.

- active: the avatar will be decorated according to activeAppearance, e.g. `ring`.
- inactive: the avatar will be partially transparent (0.8 opacity).
- unset: normal display

### ActiveAppearance

`activeAppearance` can be used when `active` prop set to `active`.
It adds `ring` as extra visual.

### Badge

The `Avatar` component can include presence badge when active prop is undefined or `unset`.

### Color

The Avatar supports color variants when displaying initials or an icon:

- Neutral - Gray (default).
- Brand - Brand colors from the theme
- Colorful - Pick from a list of pre-defined Avatar colors. The color will be assigned based on a hash of the name (to "randomly" assign a person a color). The color name (like darkRed) can also be specified explicitly in case the use case requires a different algorithm to pick the color.

### Icon

The `Avatar` component can include an `icon` that appears if there's no image or initials.

### Image

The `Avatar` component can include an `image`.

### Initials

Initials can be passed using `initials` prop or generated from `name` prop using getInitials method.
Here are the requirements from Web spec:

1. If only one word is provided, pull the first letter of the word.
2. If 2 words provided, pull first letter of both words.
3. If 2+ words provided, pull first letter of first word and last word.
4. Ignore suffixes (i.e. Jr, III).
5. Ignore words in parantheses Ignore special characters i.e. parantheses, dashes If numeric, fall back to Icon If first character is not alphabetic, fall back to icon.

But requirements are still being discussed. This area will be updated once we come up with final solition. There are different implementations in different teams.

### Name

Name prop is used to generate initials.

### Shape

The Avatar supports a circular and square (with rounded corners) shape.

### Sizes

`Avatar` supports next sizes: `20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120`.
Default size for win32 is 24.

## API

### Slots

The `Avatar` component has the following slots:

- `root` - The outer container representing the `Avatar` wrapper.
- `image` - If specified, renders an `image`
- `initials` - If specified, renders initials when there's no `image`
- `icon` - If specified, renders an `icon` if there's no `image` or `initials`.
- `initialsBackground` - It's a wrapper for initials and icon.
- `ring` - If specified, renders the ring for the `Avatar` when active prop is set to `active`.
- `badge` - If specified, renders presence badge. Example: `badge={{ status: 'outOfOffice' }}.`.

The slots can be modified using the `compose` function on the `Avatar`. For more information on using the `compose` API, please see [this page](../../framework/composition/README.md).

### Props

```ts
export interface JSAvatarProps extends IViewProps, AvatarConfigurableProps {
  /**
   * Activity indicator
   * * active: the avatar will be decorated according to activeAppearance
   * * inactive: the avatar will be reduced in size and partially transparent
   * * unset: normal display
   *
   * @defaultvalue unset
   */
  active?: AvatarActive;

  /**
   * The appearance when `active="active"`
   *
   * @defaultvalue ring
   */
  activeAppearance?: AvatarActiveAppearance;

  /**
   * Badge shows the avatar's presence status.
   * Badge can be shown only if `active` prop is undefined or unset
   */
  badge?: PresenceBadgeProps;

  /**
   * Icon to be displayed when the avatar doesn't have an image or initials.
   *
   * @defaultvalue `PersonRegular` (the default icon's size depends on the Avatar's size)
   */
  icon?: IconSourcesType;

  /**
   * Specify a string to be used instead of the name, to determine which color to use when color="colorful".
   * Use this when a name is not available, but there is another unique identifier that can be used instead.
   */
  idForColor?: string;

  /**
   * The initials are displayed when there is no image (including while the image is loading).
   *
   * It is usually not necessary to specify custom initials; by default they will be derived from the `name` prop, using the `getInitials` function.
   */
  initials?: string;

  /**
   * The name of the person or entity represented by this Avatar. This should always be provided if it is available.
   *
   * The name will be used to determine the initials displayed when there is no icon, as well as provided to
   * accessibility tools.
   */
  name?: string;

  /**
   * Size of the avatar in pixels.
   *
   * Size is restricted to a limited set of supported values recommended for most uses (see `AvatarSizeValue`) and
   * based on design guidelines for the Avatar control.
   *
   * @defaultvalue 24
   */
  size?: AvatarSize;

  /**
   * The avatar can have a circular or square shape.
   * @defaultvalue circular
   */
  shape?: AvatarShape;

  /**
   * Shorthand for passing image URL instead of using `image` prop
   */
  imageUrl?: string;
}
```

### Styling Tokens

Tokens can be used to customize the styling of the control by using the `customize` function on the `Avatar`. For more information on using the `customize` API, please see [this page](../../framework/composition/README.md). The `Avatar` has the following tokens:

```ts
export interface JSAvatarTokens extends IBackgroundColorTokens, IForegroundColorTokens, AvatarConfigurableProps, IBorderTokens, FontTokens {
  /**
   * Avatar ocality which is changed depending on `active` prop.
   */
  avatarOpacity?: number;

  /**
   * The size of presence badge.
   */
  badgeSize?: BadgeSize;

  /**
   * The icon color.
   */
  iconColor?: ColorValue;

  /**
   * The size of the icon.
   */
  iconSize?: number;

  /**
   * The height of the avatar.
   */
  height?: number;

  /**
   * Avatar shapes:
   */
  circular?: JSAvatarTokens;
  square?: JSAvatarTokens;

  /**
   * Token for inactive value of `active` prop
   */
  inactive?: JSAvatarTokens;

  /**
   * The width of the avatar.
   */
  width?: number;

  /**
   * Avatar sizes:
   */
  size20?: JSAvatarTokens;
  size24?: JSAvatarTokens;
  size28?: JSAvatarTokens;
  size32?: JSAvatarTokens;
  size36?: JSAvatarTokens;
  size40?: JSAvatarTokens;
  size48?: JSAvatarTokens;
  size56?: JSAvatarTokens;
  size64?: JSAvatarTokens;
  size72?: JSAvatarTokens;
  size96?: JSAvatarTokens;
  size120?: JSAvatarTokens;

  /**
   * Avatar colors:
   */
  neutral?: JSAvatarTokens;
  brand?: JSAvatarTokens;
  darkRed?: JSAvatarTokens;
  cranberry?: JSAvatarTokens;
  red?: JSAvatarTokens;
  pumpkin?: JSAvatarTokens;
  peach?: JSAvatarTokens;
  marigold?: JSAvatarTokens;
  gold?: JSAvatarTokens;
  brass?: JSAvatarTokens;
  brown?: JSAvatarTokens;
  forest?: JSAvatarTokens;
  seafoam?: JSAvatarTokens;
  darkGreen?: JSAvatarTokens;
  lightTeal?: JSAvatarTokens;
  teal?: JSAvatarTokens;
  steel?: JSAvatarTokens;
  blue?: JSAvatarTokens;
  royalBlue?: JSAvatarTokens;
  cornflower?: JSAvatarTokens;
  navy?: JSAvatarTokens;
  lavender?: JSAvatarTokens;
  purple?: JSAvatarTokens;
  grape?: JSAvatarTokens;
  lilac?: JSAvatarTokens;
  pink?: JSAvatarTokens;
  magenta?: JSAvatarTokens;
  plum?: JSAvatarTokens;
  beige?: JSAvatarTokens;
  mink?: JSAvatarTokens;
  platinum?: JSAvatarTokens;
  anchor?: JSAvatarTokens;
}
```

## Behaviors

### States

The following section describes the different states which `Avatar` can be in as a result of interaction.

#### showRing state

Ring is shown when `showRing` is set to true

#### transparentRing state

Makes ring transparent

#### showBadge state

showBadge is set to true when `active` prop is `unset` or undefined

### Interaction

For now Avatar doesn't support interactions.
For the next step we will need to add tooltip and onClick handler.

## Accessibility
