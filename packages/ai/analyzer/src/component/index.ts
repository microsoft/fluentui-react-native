// Component-state analyzer — drives the per-state matrix that downstream
// theme / a11y / token analyzers consume. Populated by
// `plans/03-component-analyzer.md`.

export type {
  ComponentInteraction,
  ComponentMetadata,
  ComponentStateSpec,
} from './ComponentMetadata.ts';

export { validateMetadata } from './validateMetadata.ts';
export type { ValidateMetadataResult } from './validateMetadata.ts';

export { runComponentMatrix } from './runComponentMatrix.ts';
export type {
  ComponentMatrixOptions,
  StateSnapshot,
  ThemeProviderFactory,
} from './runComponentMatrix.ts';

export { analyzeComponent } from './analyzeComponent.ts';
export type { AnalyzeComponentInput, AnalyzeComponentResult } from './analyzeComponent.ts';
