# Avatar

## Background

The Avatar component represents a person or entity. It displays the person's image, initials, or an icon, and can be either circular or square.
Previously it was a component PersonaCoin which used an old version of framework. There are more details in MIGRATION.md.

```ts
import { Avatar } from '@fluentui-react-native/avatar';
```

## Sample Code

Basic examples:

```jsx
  <Avatar />
  <Avatar icon={{ svgSource: { uri: 'https://www.example.com/test.svg', viewBox: '0 0 100 100' } }} size={120} />
  <Avatar src="../../path-to-image.png" active="active" activeAppearance="ring" size={56} />
  <Avatar shape="square" avatarColor="purple" name="Richard Feynman" />
```

More examples on the [Test pages for the Avatar](../../../apps/tester-core/src/TestComponents/Avatar). Instructions on running the tester app can be found [here](../../../apps/fluent-tester/README.md).

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
- Brand Inverted - Inverted brand colors. Only supported for android.
- Accent - Only supported for android.
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
5. Ignore words in parantheses Ignore special characters i.e. parantheses, dashes If numeric, fall back to Icon. If first character is not alphabetic, fall back to icon.

But requirements are still being discussed. This area will be updated once we come up with final solution. There are different implementations in different teams.

### Name

Name prop is used to generate initials.

### Shape

The Avatar supports a circular and square (with rounded corners) shape.

### Sizes

`Avatar` supports the following sizes: `20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120`.
Android only supports the following sizes: `16, 20, 24, 32, 40, 56, 72`. Badge is not displayed for Size 16.

Default size is 24.

## API

### Slots

The `Avatar` component has the following slots:

- `root` - The outer container representing the `Avatar` wrapper.
- `image` - If specified, renders an `image`
- `initials` - If specified, renders initials when there's no `image`
- `icon` - If specified, renders an `icon` if there's no `image` or `initials`.
- `initialsBackground` - It's a wrapper for initials and icon.
- `ring` - If specified, renders the ring for the `Avatar` when active prop is set to `active`.
- `ring` - If specified, renders the ring for the `Avatar` when active prop is set to `active`.
- `outerRing` - If specified, renders an additional ring for the `Avatar` when active prop is set to `active`. Only android.
- `badge` - If specified, renders presence badge. Example: `badge={{ status: 'outOfOffice' }}.`.

The slots can be modified using the `compose` function on the `Avatar`. For more information on using the `compose` API, please see [this page](../../framework/composition/README.md).

### Props

```ts
export interface AvatarProps extends IViewProps, AvatarConfigurableProps {
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
   * The Avatar's image.
   */
  image?: ImageProps;

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
export interface AvatarTokens extends IBackgroundColorTokens, IForegroundColorTokens, AvatarConfigurableProps, IBorderTokens, FontTokens {
  /**
   * Avatar opacity which is changed depending on `active` prop.
   */
  avatarOpacity?: number;

  /**
   * The size of presence badge.
   */
  badgeSize?: BadgeSize;

  /**
   * The x position of presence badge.
   * This is used to override the default position of the badge picked from presenceBadge tokens.
   * 0 aligns the badge (including its margin) to the right edge of the avatar.
   */
  badgeX?: number;

  /**
   * The y position of presence badge.
   * This is used to override the default position of the badge picked from presenceBadge tokens.
   * 0 aligns the badge (including its margin) to the bottom edge of the avatar.
   */
  badgeY?: number;

  /**
   * The icon color.
   */
  iconColor?: ColorValue;

  /**
   * The size of the icon.
   */
  iconSize?: number;

  /**
   * Avatar shapes:
   */
  circular?: AvatarTokens;
  square?: AvatarTokens;

  /**
   * Token for inactive value of `active` prop
   */
  inactive?: AvatarTokens;

  size16?: AvatarTokens;
  size20?: AvatarTokens;
  size24?: AvatarTokens;

  /** Not applicable for @platform android */
  size28?: AvatarTokens;

  size32?: AvatarTokens;

  /** Not applicable for @platform android */
  size36?: AvatarTokens;

  size40?: AvatarTokens;

  /** Not applicable for @platform android */
  size48?: AvatarTokens;

  size56?: AvatarTokens;

  /** Not applicable for @platform android */
  size64?: AvatarTokens;

  size72?: AvatarTokens;

  /** Not applicable for @platform android */
  size96?: AvatarTokens;

  /** Not applicable for @platform android */
  size120?: AvatarTokens;

  /**
   * Avatar colors:
   */
  neutral?: AvatarTokens;
  brand?: AvatarTokens;
  darkRed?: AvatarTokens;
  cranberry?: AvatarTokens;
  red?: AvatarTokens;
  pumpkin?: AvatarTokens;
  peach?: AvatarTokens;
  marigold?: AvatarTokens;
  gold?: AvatarTokens;
  brass?: AvatarTokens;
  brown?: AvatarTokens;
  forest?: AvatarTokens;
  seafoam?: AvatarTokens;
  darkGreen?: AvatarTokens;
  lightTeal?: AvatarTokens;
  teal?: AvatarTokens;
  steel?: AvatarTokens;
  blue?: AvatarTokens;
  royalBlue?: AvatarTokens;
  cornflower?: AvatarTokens;
  navy?: AvatarTokens;
  lavender?: AvatarTokens;
  purple?: AvatarTokens;
  grape?: AvatarTokens;
  lilac?: AvatarTokens;
  pink?: AvatarTokens;
  magenta?: AvatarTokens;
  plum?: AvatarTokens;
  beige?: AvatarTokens;
  mink?: AvatarTokens;
  platinum?: AvatarTokens;
  anchor?: AvatarTokens;
}
```

## Behaviors

### States

The following section describes the different states which `Avatar` can be in as a result of interaction.

#### showRing state

Ring is shown when `showRing` is set to true.

#### transparentRing state

Makes ring transparent.

#### showBadge state

showBadge is set to true when `active` prop is `unset` or undefined.

### Interaction

For now Avatar doesn't support interactions.
For the next step we will need to add tooltip and onClick handler.

## Accessibility
