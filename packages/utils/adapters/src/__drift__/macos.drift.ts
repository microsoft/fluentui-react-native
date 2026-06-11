/**
 * Drift test for `react-native-macos`. Checked in isolation by `tsconfig.macos.json`.
 * Fails to compile if `ViewPropsMacOS`/`TextPropsMacOS`/`ImagePropsMacOS` in `../platformProps.ts`
 * no longer cover the same fork-specific prop keys. `ExtraKeys` allows the canonical `react-native`
 * base props, plus the props the macOS filter masks intentionally inject because the fork's *types*
 * omit them even though they exist at runtime (`onPreferredScrollerStyleDidChange` on View;
 * `enableFocusRing`/`tooltip` on Text — see the comments in `../filters.macos.ts`).
 */
import type RN from 'react-native';
import type { ViewProps, TextProps, ImageProps } from 'react-native-macos';
import type { ViewPropsMacOS, TextPropsMacOS, ImagePropsMacOS } from '../platformProps';
import type { AssertNoKeyDrift, MissingKeys, ExtraKeys } from './driftHelpers';

// Props the macOS View mask passes that react-native-macos omits from its *types* (injected at runtime).
type MacOSViewInjected = 'onPreferredScrollerStyleDidChange' | 'passthroughAllKeyEvents' | 'tooltip' | 'validKeysDown' | 'validKeysUp';
// Props the macOS Text mask passes that react-native-macos omits from its *types* (injected at runtime).
type MacOSTextInjected = 'enableFocusRing' | 'focusable' | 'onMouseEnter' | 'onMouseLeave' | 'tooltip';

export type _viewMissing = AssertNoKeyDrift<MissingKeys<ViewProps, ViewPropsMacOS>>;
export type _viewExtra = AssertNoKeyDrift<ExtraKeys<ViewProps, ViewPropsMacOS, keyof RN.ViewProps | MacOSViewInjected>>;

export type _textMissing = AssertNoKeyDrift<MissingKeys<TextProps, TextPropsMacOS>>;
export type _textExtra = AssertNoKeyDrift<ExtraKeys<TextProps, TextPropsMacOS, keyof RN.TextProps | MacOSTextInjected>>;

export type _imageMissing = AssertNoKeyDrift<MissingKeys<ImageProps, ImagePropsMacOS>>;
export type _imageExtra = AssertNoKeyDrift<ExtraKeys<ImageProps, ImagePropsMacOS, keyof RN.ImageProps>>;
