// Shared types — the analyzer's public contract.
export type { RenderNode, SlotPath, AnalyzerOutput, AnalyzerIssue } from './types.ts';

// Tree utilities shared by all areas.
export { walkTree, normalizeRenderTree, serializeRenderTree } from './tree/index.ts';
export type { RenderNodeVisitor } from './tree/index.ts';

// Theme / token reverse-mapping (brief 01). This area owns the
// canonical `TokenRegistry`, `ComponentTokenMap`, and `TestThemeBundle`
// types; the component-state analyzer (brief 03) imports them directly.
export { createTestTheme } from './theme/index.ts';
export type { CreateTestThemeOptions, TestThemeBundle } from './theme/index.ts';
export { createTokenRegistry } from './theme/index.ts';
export type { TokenRegistry, TokenRegistryEntry } from './theme/index.ts';
export { resolveStyleToTokens } from './theme/index.ts';
export type { ResolvedStyleEntry } from './theme/index.ts';
export { extractStyles } from './theme/index.ts';
export type { ExtractedStyle } from './theme/index.ts';
export { mapComponentToTokens } from './theme/index.ts';
export type { ComponentTokenMap } from './theme/index.ts';

// Accessibility analyzer (brief 02).
export { extractA11yTree, serializeA11yTree, defaultA11yRules, findA11yIssues } from './a11y/index.ts';
export type { A11yNode, A11yRule } from './a11y/index.ts';

// Component state analyzer (brief 03). The declarative
// `ComponentMetadata`, `ComponentInteraction`, and derived state types
// live in `@fluentui-react-native/concepts` — consumers should import
// them from there. The analyzer re-exports the runtime drivers and
// validation/derivation helpers built on top of those types.
export {
  analyzeComponent,
  runComponentMatrix,
  validateAndDerive,
  validateMetadata,
} from './component/index.ts';
export type {
  AnalyzeComponentInput,
  AnalyzeComponentResult,
  ComponentMatrixOptions,
  MatrixHarness,
  StateSnapshot,
  ThemeProviderFactory,
  ValidateMetadataResult,
} from './component/index.ts';
