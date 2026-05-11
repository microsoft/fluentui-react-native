// Public surface of the analyzer's theme/token-mapping area.
//
// Two production groupings:
//   1. The test theme + registry (createTestTheme, createTokenRegistry).
//      These build a Theme whose every leaf value is a unique sentinel,
//      plus a path<->value registry that the reverse-mapper uses.
//   2. The style-to-token pipeline (extractStyles, resolveStyleToTokens,
//      mapComponentToTokens). These consume a rendered tree and produce
//      slot-by-slot token attributions.
//
// No `export *` here — repo lint rule `@rnx-kit/no-export-all` forbids it,
// and explicit exports keep the barrel honest as the area evolves.

export { createTestTheme } from './createTestTheme.ts';
export type { TestThemeBundle } from './createTestTheme.ts';

export { createTokenRegistry } from './tokenRegistry.ts';
export type { TokenRegistry, TokenRegistryEntry } from './tokenRegistry.ts';

export { resolveStyleToTokens } from './resolveStyleToTokens.ts';
export type { ResolvedStyleEntry } from './resolveStyleToTokens.ts';

export { extractStyles } from './extractStyles.ts';
export type { ExtractedStyle } from './extractStyles.ts';

export { mapComponentToTokens } from './mapComponentToTokens.ts';
export type { ComponentTokenMap } from './mapComponentToTokens.ts';
