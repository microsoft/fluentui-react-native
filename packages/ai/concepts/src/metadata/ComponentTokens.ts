import type { Platform } from '../concepts/platform.ts';

import type { TokenLayer } from './TokenSource.ts';

/**
 * A captured token tree for one platform variant of one component.
 *
 * - `component` matches the `ComponentMetadata.name` it pairs with.
 * - `platform` is `'default'` for the cross-platform `<Name>Tokens.ts`
 *   file, or a `Platform` value for `<Name>Tokens.<platform>.ts`
 *   overrides. Platform-override artifacts are sparse — only values
 *   that differ from the default are recorded.
 * - `layers` is the layered tree from the source file.
 *
 * One component typically has several `ComponentTokens` documents
 * (color / font / layout × platform). The deriver
 * (`resolveTokensForState`) takes a list and merges them in order.
 */
export interface ComponentTokens {
  component: string;
  platform: 'default' | Platform;
  layers: TokenLayer;
}
