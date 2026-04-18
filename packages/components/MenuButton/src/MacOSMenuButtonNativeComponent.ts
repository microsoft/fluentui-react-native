/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 * @format
 */

import type { HostComponent, ViewProps } from 'react-native';

import type { BubblingEventHandler, Int32, Double, UnsafeMixed, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

/*
interface MenuItem {
  title?: string;
  image?: ImageURISource;
  enabled?: boolean;
  identifier?: string;
  hasSubmenu?: boolean;
  submenu: MenuItem[];
}
*/

export interface ImageURISource {
  /**
   * `uri` is a string representing the resource identifier for the image, which
   * could be an http address, a local file path, or the name of a static image
   * resource (which should be wrapped in the `require('./path/to/image.png')`
   * function).
   */
  uri?: string | undefined;
  /**
   * `bundle` is the iOS asset bundle which the image is included in. This
   * will default to [NSBundle mainBundle] if not set.
   * @platform ios
   */
  bundle?: string | undefined;
  /**
   * `method` is the HTTP Method to use. Defaults to GET if not specified.
   */
  method?: string | undefined;
  /**
   * `headers` is an object representing the HTTP headers to send along with the
   * request for a remote image.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  headers?: {} | undefined;
  /**
   * `cache` determines how the requests handles potentially cached
   * responses.
   *
   * - `default`: Use the native platforms default strategy. `useProtocolCachePolicy` on iOS.
   *
   * - `reload`: The data for the URL will be loaded from the originating source.
   * No existing cache data should be used to satisfy a URL load request.
   *
   * - `force-cache`: The existing cached data will be used to satisfy the request,
   * regardless of its age or expiration date. If there is no existing data in the cache
   * corresponding the request, the data is loaded from the originating source.
   *
   * - `only-if-cached`: The existing cache data will be used to satisfy a request, regardless of
   * its age or expiration date. If there is no existing data in the cache corresponding
   * to a URL load request, no attempt is made to load the data from the originating source,
   * and the load is considered to have failed.
   */
  cache?: WithDefault<'default' | 'reload' | 'force-cache' | 'only-if-cached', 'default'>;
  /**
   * `body` is the HTTP body to send with the request. This must be a valid
   * UTF-8 string, and will be sent exactly as specified, with no
   * additional encoding (e.g. URL-escaping or base64) applied.
   */
  body?: string | undefined;
  /**
   * `width` and `height` can be specified if known at build time, in which case
   * these will be used to set the default `<Image/>` component dimensions.
   */
  width?: Double | undefined;
  height?: Double | undefined;
  /**
   * `scale` is used to indicate the scale factor of the image. Defaults to 1.0 if
   * unspecified, meaning that one image pixel equates to one display point / DIP.
   */
  scale?: Double | undefined;
}

export interface NativeProps extends ViewProps {
  content?: string;
  image?: ImageURISource;
  enabled?: boolean;
  menu?: UnsafeMixed;

  onItemClick?: BubblingEventHandler<{ key: string }>;
  onSubmenuItemClick?: BubblingEventHandler<{ index: Int32; key: string }>;
}

export default codegenNativeComponent<NativeProps>('FRNMenuButton') as HostComponent<NativeProps>;
