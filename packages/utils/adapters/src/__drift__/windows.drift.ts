/**
 * Drift test for `react-native-windows`. Checked in isolation by `tsconfig.windows.json`.
 * Fails to compile if `ViewPropsWindows`/`TextPropsWindows`/`ImagePropsWindows` in
 * `../platformProps.ts` no longer cover the same fork-specific prop keys. `ExtraKeys` allows the
 * canonical `react-native` base props since the fork can lag behind core RN.
 */
import type RN from 'react-native';
import type { ViewProps, TextProps, ImageProps } from 'react-native-windows';
import type { ViewPropsWindows, TextPropsWindows, ImagePropsWindows } from '../platformProps';
import type { AssertNoKeyDrift, MissingKeys, ExtraKeys } from './driftHelpers';

export type _viewMissing = AssertNoKeyDrift<MissingKeys<ViewProps, ViewPropsWindows>>;
export type _viewExtra = AssertNoKeyDrift<ExtraKeys<ViewProps, ViewPropsWindows, keyof RN.ViewProps>>;

export type _textMissing = AssertNoKeyDrift<MissingKeys<TextProps, TextPropsWindows>>;
export type _textExtra = AssertNoKeyDrift<ExtraKeys<TextProps, TextPropsWindows, keyof RN.TextProps>>;

export type _imageMissing = AssertNoKeyDrift<MissingKeys<ImageProps, ImagePropsWindows>>;
export type _imageExtra = AssertNoKeyDrift<ExtraKeys<ImageProps, ImagePropsWindows, keyof RN.ImageProps>>;
