import type { AnalyzerIssue } from '../types.ts';
import type { ComponentInteraction, ComponentMetadata, ComponentStateSpec } from './ComponentMetadata.ts';

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
 * This is intentionally string-typed — it never imports the component
 * referenced in `importPath`. The goal is to catch metadata mistakes
 * (missing fields, wrong types, dangling `targetTestID`s) before the
 * driver tries to render anything.
 *
 * Issue rules emitted, all namespaced under `component/`:
 * - `component/missing-field` (error)        Required field absent.
 * - `component/invalid-type` (error)         Field present but wrong type.
 * - `component/duplicate-state-id` (error)   Two states share an id.
 * - `component/empty-states` (error)         `states` array is empty.
 * - `component/dangling-testid` (warning)    Interaction references a
 *   `targetTestID` that doesn't appear as a `testID` prop in any state
 *   or in `baseProps`. Warning rather than error because the agent
 *   may legitimately produce the testID via children or composition
 *   the validator can't see statically.
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

  // Required string fields on the root document.
  const name = requireString(record, 'name', issues);
  const importPath = requireString(record, 'importPath', issues);
  const exportName = requireString(record, 'exportName', issues);

  // Optional `baseProps`.
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

  // Required `states` array.
  let states: ComponentStateSpec[] | null = null;
  if (!Array.isArray(record.states)) {
    issues.push({
      severity: 'error',
      rule: 'component/missing-field',
      message: 'metadata.states must be an array',
    });
  } else if (record.states.length === 0) {
    issues.push({
      severity: 'error',
      rule: 'component/empty-states',
      message: 'metadata.states must contain at least one entry',
    });
  } else {
    states = [];
    const seenIds = new Set<string>();
    for (let i = 0; i < record.states.length; i++) {
      const validated = validateState(record.states[i], i, issues);
      if (validated) {
        if (seenIds.has(validated.id)) {
          issues.push({
            severity: 'error',
            rule: 'component/duplicate-state-id',
            message: `metadata.states[${i}].id '${validated.id}' is used more than once`,
          });
        }
        seenIds.add(validated.id);
        states.push(validated);
      }
    }
  }

  // If anything error-severity was reported, refuse to surface the
  // metadata even when the rest of the shape happens to match.
  const hasError = issues.some((issue) => issue.severity === 'error');
  if (hasError || name === null || importPath === null || exportName === null || states === null) {
    return { metadata: null, issues };
  }

  // testID cross-check is best-effort and never escalates to error.
  collectTestIDIssues(baseProps, states, issues);

  const metadata: ComponentMetadata = {
    name,
    importPath,
    exportName,
    states,
  };
  if (baseProps !== undefined) {
    metadata.baseProps = baseProps;
  }
  return { metadata, issues };
}

function validateState(value: unknown, index: number, issues: AnalyzerIssue[]): ComponentStateSpec | null {
  if (!isPlainObject(value)) {
    issues.push({
      severity: 'error',
      rule: 'component/invalid-type',
      message: `metadata.states[${index}] must be an object`,
    });
    return null;
  }
  const id = requireString(value, 'id', issues, `metadata.states[${index}].id`);
  if (id === null) {
    return null;
  }

  let props: Record<string, unknown> | undefined;
  if (value.props !== undefined) {
    if (isPlainObject(value.props)) {
      props = value.props;
    } else {
      issues.push({
        severity: 'error',
        rule: 'component/invalid-type',
        message: `metadata.states[${index}].props must be an object when provided`,
      });
      return null;
    }
  }

  let description: string | undefined;
  if (value.description !== undefined) {
    if (typeof value.description === 'string') {
      description = value.description;
    } else {
      issues.push({
        severity: 'error',
        rule: 'component/invalid-type',
        message: `metadata.states[${index}].description must be a string when provided`,
      });
      return null;
    }
  }

  let interactions: ComponentInteraction[] | undefined;
  if (value.interactions !== undefined) {
    if (!Array.isArray(value.interactions)) {
      issues.push({
        severity: 'error',
        rule: 'component/invalid-type',
        message: `metadata.states[${index}].interactions must be an array when provided`,
      });
      return null;
    }
    interactions = [];
    for (let j = 0; j < value.interactions.length; j++) {
      const ix = validateInteraction(value.interactions[j], `metadata.states[${index}].interactions[${j}]`, issues);
      if (ix === null) {
        return null;
      }
      interactions.push(ix);
    }
  }

  const state: ComponentStateSpec = { id };
  if (props !== undefined) {
    state.props = props;
  }
  if (interactions !== undefined) {
    state.interactions = interactions;
  }
  if (description !== undefined) {
    state.description = description;
  }
  return state;
}

function validateInteraction(value: unknown, label: string, issues: AnalyzerIssue[]): ComponentInteraction | null {
  if (!isPlainObject(value)) {
    issues.push({
      severity: 'error',
      rule: 'component/invalid-type',
      message: `${label} must be an object`,
    });
    return null;
  }
  const kind = value.kind;
  if (typeof kind !== 'string') {
    issues.push({
      severity: 'error',
      rule: 'component/missing-field',
      message: `${label}.kind must be a string`,
    });
    return null;
  }

  switch (kind) {
    case 'press':
    case 'focus':
    case 'blur': {
      const targetTestID = requireString(value, 'targetTestID', issues, `${label}.targetTestID`);
      if (targetTestID === null) {
        return null;
      }
      return { kind, targetTestID };
    }
    case 'hover': {
      const targetTestID = requireString(value, 'targetTestID', issues, `${label}.targetTestID`);
      if (targetTestID === null) {
        return null;
      }
      const state = value.state;
      if (state !== 'in' && state !== 'out') {
        issues.push({
          severity: 'error',
          rule: 'component/invalid-type',
          message: `${label}.state must be 'in' or 'out'`,
        });
        return null;
      }
      return { kind: 'hover', targetTestID, state };
    }
    case 'changeText': {
      const targetTestID = requireString(value, 'targetTestID', issues, `${label}.targetTestID`);
      if (targetTestID === null) {
        return null;
      }
      if (typeof value.text !== 'string') {
        issues.push({
          severity: 'error',
          rule: 'component/invalid-type',
          message: `${label}.text must be a string`,
        });
        return null;
      }
      return { kind: 'changeText', targetTestID, text: value.text };
    }
    case 'scroll': {
      const targetTestID = requireString(value, 'targetTestID', issues, `${label}.targetTestID`);
      if (targetTestID === null) {
        return null;
      }
      const offset = value.offset;
      if (!isPlainObject(offset) || typeof offset.x !== 'number' || typeof offset.y !== 'number') {
        issues.push({
          severity: 'error',
          rule: 'component/invalid-type',
          message: `${label}.offset must be { x: number; y: number }`,
        });
        return null;
      }
      return { kind: 'scroll', targetTestID, offset: { x: offset.x, y: offset.y } };
    }
    case 'custom': {
      if (typeof value.name !== 'string') {
        issues.push({
          severity: 'error',
          rule: 'component/missing-field',
          message: `${label}.name must be a string`,
        });
        return null;
      }
      return { kind: 'custom', name: value.name, payload: value.payload };
    }
    default: {
      issues.push({
        severity: 'error',
        rule: 'component/invalid-type',
        message: `${label}.kind '${kind}' is not a recognized interaction`,
      });
      return null;
    }
  }
}

function collectTestIDIssues(
  baseProps: Record<string, unknown> | undefined,
  states: readonly ComponentStateSpec[],
  issues: AnalyzerIssue[],
): void {
  const baseTestID = typeof baseProps?.testID === 'string' ? baseProps.testID : undefined;

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const interactions = state.interactions ?? [];
    if (interactions.length === 0) {
      continue;
    }
    const stateTestID = typeof state.props?.testID === 'string' ? state.props.testID : undefined;
    const knownTestIDs = new Set<string>();
    if (baseTestID !== undefined) {
      knownTestIDs.add(baseTestID);
    }
    if (stateTestID !== undefined) {
      knownTestIDs.add(stateTestID);
    }

    for (let j = 0; j < interactions.length; j++) {
      const ix = interactions[j];
      if (ix.kind === 'custom') {
        continue;
      }
      const target = ix.targetTestID;
      if (!knownTestIDs.has(target)) {
        issues.push({
          severity: 'warning',
          rule: 'component/dangling-testid',
          message:
            `metadata.states[${i}].interactions[${j}] targets testID '${target}' ` +
            `which was not found in baseProps.testID or states[${i}].props.testID; ` +
            'the analyzer cannot statically confirm it will exist in the rendered tree',
        });
      }
    }
  }
}

function requireString(
  source: Record<string, unknown>,
  field: string,
  issues: AnalyzerIssue[],
  label: string = `metadata.${field}`,
): string | null {
  const value = source[field];
  if (value === undefined) {
    issues.push({
      severity: 'error',
      rule: 'component/missing-field',
      message: `${label} is required`,
    });
    return null;
  }
  if (typeof value !== 'string') {
    issues.push({
      severity: 'error',
      rule: 'component/invalid-type',
      message: `${label} must be a string`,
    });
    return null;
  }
  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
