/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { HostComponent, ViewProps, ImageURISource } from 'react-native';

import type { BubblingEventHandler, Int32, UnsafeMixed } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

type ImageSource = ImageURISource;

/*
interface MenuItem {
  title?: string;
  image?: UnsafeMixed;
  enabled?: boolean;
  identifier?: string;
  hasSubmenu?: boolean;
  submenu: MenuItem[];
}
*/

export interface NativeProps extends ViewProps {
  content?: string;
  image?: ImageSource;
  enabled?: boolean;
  menu?: UnsafeMixed;

  onItemClick?: BubblingEventHandler<{ key: string }>;
  onSubmenuItemClick?: BubblingEventHandler<{ index: Int32; key: string }>;
}

export default codegenNativeComponent<NativeProps>('FRNMenuButton') as HostComponent<NativeProps>;
