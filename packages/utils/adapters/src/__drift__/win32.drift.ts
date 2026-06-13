/**
 * Drift test for `@office-iss/react-native-win32`. Checked in isolation by `tsconfig.win32.json`.
 * Fails to compile if `ViewPropsWin32`/`TextPropsWin32`/`ImagePropsWin32` in `../platformProps.ts`
 * no longer cover the same fork-specific prop keys. `ExtraKeys` allows the canonical `react-native`
 * base props since the fork can lag behind core RN.
 */
import type RN from 'react-native';
import type { ViewProps, TextProps, ImageProps } from '@office-iss/react-native-win32';
import type { ViewPropsWin32, TextPropsWin32, ImagePropsWin32 } from '../platformProps';
import type { AssertNoKeyDrift, MissingKeys, ExtraKeys } from './driftHelpers';

export type _viewMissing = AssertNoKeyDrift<MissingKeys<ViewProps, ViewPropsWin32>>;
export type _viewExtra = AssertNoKeyDrift<ExtraKeys<ViewProps, ViewPropsWin32, keyof RN.ViewProps>>;

export type _textMissing = AssertNoKeyDrift<MissingKeys<TextProps, TextPropsWin32>>;
export type _textExtra = AssertNoKeyDrift<ExtraKeys<TextProps, TextPropsWin32, keyof RN.TextProps>>;

export type _imageMissing = AssertNoKeyDrift<MissingKeys<ImageProps, ImagePropsWin32>>;
export type _imageExtra = AssertNoKeyDrift<ExtraKeys<ImageProps, ImagePropsWin32, keyof RN.ImageProps>>;
