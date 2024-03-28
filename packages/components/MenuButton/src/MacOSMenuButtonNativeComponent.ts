/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { HostComponent, ImageSourcePropType, ViewProps } from 'react-native';

import type { BubblingEventHandler, Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

interface MenuItem {
  title?: string;
  image?: ImageSourcePropType;
  enabled?: boolean;
  identifier?: string;
  hasSubmenu?: boolean;
  submenu: MenuItem[];
}

export interface NativeProps extends ViewProps {
  content?: string;
  image?: ImageSourcePropType;
  enabled?: boolean;
  menu?: MenuItem;

  onItemClick?: BubblingEventHandler<{ key: string }>;
  onSubmenuItemClick?: BubblingEventHandler<{ index: Int32; key: string }>;
}

export default codegenNativeComponent<NativeProps>('FRNMenuButton') as HostComponent<NativeProps>;
