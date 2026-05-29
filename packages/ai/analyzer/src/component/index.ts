// Component-state analyzer — drives the per-state matrix that
// downstream theme / a11y / token analyzers consume. The declarative
// `ComponentMetadata` shape lives in `@fluentui-react-native/concepts`;
// this area imports it and adds the runtime drivers.

export { validateMetadata, validateAndDerive } from './validateMetadata.ts';
export type { ValidateMetadataResult } from './validateMetadata.ts';

export { runComponentMatrix } from './runComponentMatrix.ts';
export type {
  ComponentMatrixOptions,
  MatrixHarness,
  StateSnapshot,
  ThemeProviderFactory,
} from './runComponentMatrix.ts';

export { analyzeComponent } from './analyzeComponent.ts';
export type { AnalyzeComponentInput, AnalyzeComponentResult } from './analyzeComponent.ts';
