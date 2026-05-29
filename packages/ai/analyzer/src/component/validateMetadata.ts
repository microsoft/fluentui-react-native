import type { ComponentMetadata, ComponentState } from '@fluentui-react-native/concepts';
import {
  COMPONENT_STATE_VALUES,
  FRAMEWORK_VALUES,
  PLATFORM_VALUES,
  SHAPE_VALUES,
  SIZE_VALUES,
  deriveComponentStates,
  isComponentState,
  isFramework,
  isPlatform,
  isShape,
  isSize,
} from '@fluentui-react-native/concepts';

import type { AnalyzerIssue } from '../types.ts';

/**
 * Result envelope returned by `validateMetadata`. The `metadata` field
 * is the input narrowed to `ComponentMetadata` when the shape checks
 * out, or `null` when an `error`-severity issue was reported.
 */
export interface ValidateMetadataResult {
  metadata: ComponentMetadata | null;
  issues: AnalyzerIssue[];
}

/**
 * Pure shape check for a candidate `ComponentMetadata` document.
 *
 * The validator never imports the component referenced in
 * `importPath`. It catches metadata mistakes (missing fields, wrong
 * enum values, dangling testIDs) before the driver tries to render
 * anything.
 *
 * Issue rules emitted, all namespaced under `component/`:
 * - `component/missing-field` (error)        Required field absent.
 * - `component/invalid-type` (error)         Field present but wrong type.
 * - `component/invalid-enum` (error)         Enum value outside its declared set.
 * - `component/empty-platforms` (error)      `platforms` array is empty.
 * - `component/dangling-testid` (warning)    Interaction states declared
 *   without a `baseProps.testID` for the deriver to target. Warning
 *   rather than error because a custom interaction harness might
 *   still find the node by other means.
 */
export function validateMetadata(input: unknown): ValidateMetadataResult {
  const issues: AnalyzerIssue[] = [];

  if (!isPlainObject(input)) {
    issues.push({
      severity: 'error',
      rule: 'component/invalid-type',
      message: 'metadata must be a plain object',
    });
    return { metadata: null, issues };
  }

  const record = input;
  const name = requireString(record, 'name', issues);
  const importPath = requireString(record, 'importPath', issues);
  const exportName = requireString(record, 'exportName', issues);

  const framework = requireEnum(record, 'framework', FRAMEWORK_VALUES, isFramework, issues);

  const platforms = requireEnumArray(record, 'platforms', PLATFORM_VALUES, isPlatform, issues);
  if (platforms !== null && platforms.length === 0) {
    issues.push({
      severity: 'error',
      rule: 'component/empty-platforms',
      message: 'metadata.platforms must contain at least one entry',
    });
  }

  const states = requireEnumArray(record, 'states', COMPONENT_STATE_VALUES, isComponentState, issues);

  const stateCombos = optionalComboArray(record, 'stateCombos', issues);

  const appearances = optionalStringArray(record, 'appearances', issues);
  const sizes = optionalEnumArray(record, 'sizes', SIZE_VALUES, isSize, issues);
  const shapes = optionalEnumArray(record, 'shapes', SHAPE_VALUES, isShape, issues);

  let baseProps: Record<string, unknown> | undefined;
  if (record.baseProps !== undefined) {
    if (isPlainObject(record.baseProps)) {
      baseProps = record.baseProps;
    } else {
      issues.push({
        severity: 'error',
        rule: 'component/invalid-type',
        message: 'metadata.baseProps must be an object when provided',
      });
    }
  }

  const hasError = issues.some((issue) => issue.severity === 'error');
  if (
    hasError ||
    name === null ||
    importPath === null ||
    exportName === null ||
    framework === null ||
    platforms === null ||
    platforms.length === 0 ||
    states === null
  ) {
    return { metadata: null, issues };
  }

  const metadata: ComponentMetadata = {
    name,
    importPath,
    exportName,
    framework,
    platforms,
    states,
  };
  if (stateCombos !== undefined) {
    metadata.stateCombos = stateCombos;
  }
  if (appearances !== undefined) {
    metadata.appearances = appearances;
  }
  if (sizes !== undefined) {
    metadata.sizes = sizes;
  }
  if (shapes !== undefined) {
    metadata.shapes = shapes;
  }
  if (baseProps !== undefined) {
    metadata.baseProps = baseProps;
  }

  collectTestIDWarning(metadata, issues);

  return { metadata, issues };
}

/**
 * Convenience helper that combines `validateMetadata` and
 * `deriveComponentStates`. Returns the derived state map alongside the
 * validation result. Useful for callers that need both without
 * threading the deriver themselves.
 */
export function validateAndDerive(input: unknown): {
  metadata: ComponentMetadata | null;
  issues: AnalyzerIssue[];
  states: ReturnType<typeof deriveComponentStates> | null;
} {
  const { metadata, issues } = validateMetadata(input);
  const states = metadata !== null ? deriveComponentStates(metadata) : null;
  return { metadata, issues, states };
}

function collectTestIDWarning(metadata: ComponentMetadata, issues: AnalyzerIssue[]): void {
  const needsTestID = metadata.states.some(
    (state) => state === 'hover' || state === 'press' || state === 'focused',
  );
  if (!needsTestID) {
    return;
  }
  const testID = metadata.baseProps?.testID;
  if (typeof testID === 'string' && testID.length > 0) {
    return;
  }
  issues.push({
    severity: 'warning',
    rule: 'component/dangling-testid',
    message:
      "metadata declares interaction-driven states (hover/press/focused) but baseProps.testID is missing; " +
      'the deriver will skip those interactions at render time',
  });
}

function requireString(
  source: Record<string, unknown>,
  field: string,
  issues: AnalyzerIssue[],
  label: string = `metadata.${field}`,
): string | null {
  const value = source[field];
  if (value === undefined) {
    issues.push({ severity: 'error', rule: 'component/missing-field', message: `${label} is required` });
    return null;
  }
  if (typeof value !== 'string') {
    issues.push({ severity: 'error', rule: 'component/invalid-type', message: `${label} must be a string` });
    return null;
  }
  if (value === '') {
    issues.push({
      severity: 'error',
      rule: 'component/invalid-type',
      message: `${label} must be a non-empty string`,
    });
    return null;
  }
  return value;
}

function requireEnum<T extends string>(
  source: Record<string, unknown>,
  field: string,
  values: readonly T[],
  guard: (value: unknown) => value is T,
  issues: AnalyzerIssue[],
): T | null {
  const value = source[field];
  if (value === undefined) {
    issues.push({
      severity: 'error',
      rule: 'component/missing-field',
      message: `metadata.${field} is required`,
    });
    return null;
  }
  if (!guard(value)) {
    issues.push({
      severity: 'error',
      rule: 'component/invalid-enum',
      message: `metadata.${field} must be one of ${values.join(', ')}`,
    });
    return null;
  }
  return value;
}

function requireEnumArray<T extends string>(
  source: Record<string, unknown>,
  field: string,
  values: readonly T[],
  guard: (value: unknown) => value is T,
  issues: AnalyzerIssue[],
): T[] | null {
  const value = source[field];
  if (!Array.isArray(value)) {
    issues.push({
      severity: 'error',
      rule: 'component/missing-field',
      message: `metadata.${field} must be an array`,
    });
    return null;
  }
  const out: T[] = [];
  for (let i = 0; i < value.length; i++) {
    if (!guard(value[i])) {
      issues.push({
        severity: 'error',
        rule: 'component/invalid-enum',
        message: `metadata.${field}[${i}] must be one of ${values.join(', ')}`,
      });
      return null;
    }
    out.push(value[i]);
  }
  return out;
}

function optionalEnumArray<T extends string>(
  source: Record<string, unknown>,
  field: string,
  values: readonly T[],
  guard: (value: unknown) => value is T,
  issues: AnalyzerIssue[],
): T[] | undefined {
  if (source[field] === undefined) {
    return undefined;
  }
  const result = requireEnumArray(source, field, values, guard, issues);
  return result === null ? undefined : result;
}

function optionalStringArray(
  source: Record<string, unknown>,
  field: string,
  issues: AnalyzerIssue[],
): string[] | undefined {
  const value = source[field];
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    issues.push({
      severity: 'error',
      rule: 'component/invalid-type',
      message: `metadata.${field} must be an array of strings when provided`,
    });
    return undefined;
  }
  const out: string[] = [];
  for (let i = 0; i < value.length; i++) {
    const entry = value[i];
    if (typeof entry !== 'string' || entry === '') {
      issues.push({
        severity: 'error',
        rule: 'component/invalid-type',
        message: `metadata.${field}[${i}] must be a non-empty string`,
      });
      return undefined;
    }
    out.push(entry);
  }
  return out;
}

function optionalComboArray(
  source: Record<string, unknown>,
  field: string,
  issues: AnalyzerIssue[],
): ComponentState[][] | undefined {
  const value = source[field];
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    issues.push({
      severity: 'error',
      rule: 'component/invalid-type',
      message: `metadata.${field} must be an array of arrays when provided`,
    });
    return undefined;
  }
  const out: ComponentState[][] = [];
  for (let i = 0; i < value.length; i++) {
    const combo = value[i];
    if (!Array.isArray(combo) || combo.length < 2) {
      issues.push({
        severity: 'error',
        rule: 'component/invalid-type',
        message: `metadata.${field}[${i}] must be an array of at least two ComponentState values`,
      });
      return undefined;
    }
    const innerOut: ComponentState[] = [];
    for (let j = 0; j < combo.length; j++) {
      if (!isComponentState(combo[j])) {
        issues.push({
          severity: 'error',
          rule: 'component/invalid-enum',
          message: `metadata.${field}[${i}][${j}] must be one of ${COMPONENT_STATE_VALUES.join(', ')}`,
        });
        return undefined;
      }
      innerOut.push(combo[j]);
    }
    out.push(innerOut);
  }
  return out;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
