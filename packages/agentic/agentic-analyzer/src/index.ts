// @fluentui-react-native/agentic-analyzer
// Public API surface for the sentinel-theme token resolver (PLAN capability #1).
export { resolveTokensForTheme } from './tests/validate.ts';
export type { ResolveTokensOptions, TokenFunction } from './tests/validate.ts';

// Sentinel-theme building blocks, exported for advanced/standalone use.
export { createSentinelTheme } from './sentinel/createSentinelTheme.ts';
export type { SentinelTheme } from './sentinel/createSentinelTheme.ts';
export { SentinelAllocator } from './sentinel/reverseMap.ts';
export type { ReverseMap } from './sentinel/reverseMap.ts';
export { deepMerge, resolveSemantic } from './sentinel/resolveSemantic.ts';
