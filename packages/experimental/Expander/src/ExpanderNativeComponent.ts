/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { ColorValue, HostComponent, ViewProps } from 'react-native';

import type { DirectEventHandler, Double, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  expandDirection?: WithDefault<'up' | 'down', 'down'>;
  expanded?: boolean;
  enabled?: boolean;
  width?: Double;
  height?: Double;
  contentHorizontalAlignment?: WithDefault<'center' | 'left' | 'right' | 'stretch', 'stretch'>;
  contentVerticalAlignment?: WithDefault<'bottom' | 'center' | 'stretch' | 'top', 'top'>;
  headerBackground?: ColorValue;
  headerForeground?: ColorValue;
  headerForegroundPointerOver?: ColorValue;
  headerForegroundPressed?: ColorValue;
  headerBorderBrush?: ColorValue;
  headerBorderPointerOverBrush?: ColorValue;
  headerBorderPressedBrush?: ColorValue;
  headerDisabledForeground?: ColorValue;
  headerDisabledBorderBrush?: ColorValue;
  headerBorderThickness?: Double;
  contentBackground?: ColorValue;
  contentBorderBrush?: ColorValue;
  chevronBackground?: ColorValue;
  chevronForeground?: ColorValue;
  chevronPointerOverBackground?: ColorValue;
  chevronPointerOverForeground?: ColorValue;
  chevronPressedBackground?: ColorValue;
  chevronPressedForeground?: ColorValue;
  chevronBorderThickness?: Double;
  chevronBorderBrush?: ColorValue;
  chevronBorderPointerOverBrush?: ColorValue;
  chevronBorderPressedBrush?: ColorValue;

  onCollapsing?: DirectEventHandler<null>;
  onExpanding?: DirectEventHandler<null>;
}

export const ExpanderComponent: HostComponent<NativeProps> = codegenNativeComponent<NativeProps>('ExpanderView');

export default ExpanderComponent;
