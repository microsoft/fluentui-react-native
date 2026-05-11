import type * as React from 'react';

import type { AnalyzerIssue } from '../types.ts';

import { findA11yIssues } from '../a11y/index.ts';

import type { ComponentMetadata } from './ComponentMetadata.ts';
import {
  runComponentMatrix,
  type ComponentMatrixOptions,
  type StateSnapshot,
} from './runComponentMatrix.ts';
import { validateMetadata } from './validateMetadata.ts';

/**
 * Input to `analyzeComponent`. The metadata is validated by the function
 * before anything is rendered, so a hand-edited document can fail fast
 * with shape errors rather than mid-render.
 */
export interface AnalyzeComponentInput<P = unknown> {
  Component: React.ComponentType<P>;
  metadata: ComponentMetadata;
  options?: ComponentMatrixOptions;
}

/**
 * Result envelope from `analyzeComponent`. The `matrix` is the full
 * `runComponentMatrix` output. The top-level `issues` collects
 * everything: metadata validation issues, snapshot render errors, and
 * accessibility issues found in any state.
 */
export interface AnalyzeComponentResult {
  matrix: Awaited<ReturnType<typeof runComponentMatrix>>;
  issues: AnalyzerIssue[];
}

/**
 * End-to-end driver for an agent: validate the metadata, run the
 * matrix, then run the default a11y rules over every captured state.
 *
 * The function never throws on a recoverable failure — anything that
 * looks like a bug in metadata or the component itself is surfaced as
 * an `AnalyzerIssue`. Hard exceptions (e.g. `React` itself missing)
 * propagate so the caller hears about environmental problems loudly.
 */
export async function analyzeComponent<P>(
  input: AnalyzeComponentInput<P>,
): Promise<AnalyzeComponentResult> {
  const issues: AnalyzerIssue[] = [];

  const { metadata: validatedMetadata, issues: validationIssues } = validateMetadata(input.metadata);
  issues.push(...validationIssues);

  if (validatedMetadata === null) {
    // Without valid metadata there's nothing meaningful to render. We
    // still produce a matrix shell so consumers can pattern-match a
    // consistent shape.
    return {
      matrix: {
        component: typeof input.metadata?.name === 'string' ? input.metadata.name : 'Unknown',
        generatedAt: new Date().toISOString(),
        data: { snapshots: [], issues: [] },
      },
      issues,
    };
  }

  const matrix = await runComponentMatrix<P>(input.Component, validatedMetadata, input.options);
  issues.push(...matrix.data.issues);

  for (const snapshot of matrix.data.snapshots) {
    collectA11yIssues(snapshot, issues);
  }

  return { matrix, issues };
}

function collectA11yIssues(snapshot: StateSnapshot, issues: AnalyzerIssue[]): void {
  if (snapshot.a11yTree === null) {
    return;
  }
  const found = findA11yIssues(snapshot.a11yTree);
  for (const issue of found) {
    // Tag the originating state so consumers can locate the failure
    // inside the matrix without keeping a separate map.
    issues.push({
      ...issue,
      message: `[state: ${snapshot.state.id}] ${issue.message}`,
    });
  }
}
