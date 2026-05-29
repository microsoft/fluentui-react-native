import * as React from 'react';
import { act } from 'react';
import * as rntl from '@testing-library/react-native';
import { ThemeProvider, ThemeReference } from '@fluentui-react-native/theme';
import type {
  ComponentInteraction,
  ComponentMetadata,
  ComponentStateEntry,
} from '@fluentui-react-native/concepts';
import { deriveComponentStates } from '@fluentui-react-native/concepts';

import type { AnalyzerIssue, AnalyzerOutput, RenderNode } from '../types.ts';
import { extractA11yTree, type A11yNode } from '../a11y/index.ts';
import { normalizeRenderTree } from '../tree/index.ts';
import {
  extractStyles,
  resolveStyleToTokens,
  type ComponentTokenMap,
  type TestThemeBundle,
} from '../theme/index.ts';

/**
 * One slice of the component matrix: a single derived state rendered,
 * driven by its interactions, and snapshotted. The `error` field, when
 * present, indicates the analyzer failed mid-state — the other fields
 * may be partial in that case.
 */
export interface StateSnapshot {
  /** The derived state key, e.g. `'primary-hover'`. */
  stateId: string;
  /** The `{ props?, interactions? }` entry the deriver produced for
   *  `stateId`. */
  entry: ComponentStateEntry;
  /** Normalized rendered tree captured after interactions ran. */
  renderTree: RenderNode | null;
  /** Accessibility tree extracted from `renderTree`. */
  a11yTree: A11yNode | null;
  /**
   * Per-slot token usage map. Populated only when `themeBundle` was
   * supplied to `runComponentMatrix`.
   */
  tokenMap?: ComponentTokenMap;
  /**
   * `AnalyzerIssue` recorded when something went wrong rendering or
   * driving this state. The matrix continues past failures rather than
   * aborting; consumers should check this and `runComponentMatrix`'s
   * top-level issues to surface problems.
   */
  error?: AnalyzerIssue;
}

/**
 * Options for `runComponentMatrix`. See field docs for usage.
 */
export interface ComponentMatrixOptions {
  /**
   * Optional test theme + registry bundle from `createTestTheme()`.
   * Without this, snapshots still capture render and a11y trees but
   * `tokenMap` is omitted, and the component is rendered without a
   * surrounding `ThemeProvider`.
   */
  themeBundle?: TestThemeBundle;
  /**
   * Optional `ThemeProvider` factory. Defaults to the real
   * `ThemeProvider` from `@fluentui-react-native/theme` wrapped around
   * a `ThemeReference`.
   */
  themeProvider?: ThemeProviderFactory;
  /**
   * Test-only injection point for the render harness. Not part of the
   * public API; exposed so unit tests can run against a deterministic
   * fake instead of `@testing-library/react-native`.
   */
  harness?: MatrixHarness;
}

export type ThemeProviderFactory = (theme: TestThemeBundle['theme']) => React.ComponentType<React.PropsWithChildren<unknown>>;

interface RenderResultLike {
  readonly root: unknown;
  toJSON(): unknown;
  unmount(): void;
  getByTestId(testID: string): unknown;
  queryByTestId(testID: string): unknown;
}

interface FireEventLike {
  (element: unknown, eventName: string, ...data: unknown[]): unknown;
  press(element: unknown, ...data: unknown[]): unknown;
  changeText(element: unknown, ...data: unknown[]): unknown;
  scroll(element: unknown, ...data: unknown[]): unknown;
}

export interface MatrixHarness {
  render(element: React.ReactElement): RenderResultLike;
  fireEvent: FireEventLike;
}

let cachedHarness: MatrixHarness | undefined;

function defaultHarness(): MatrixHarness {
  if (cachedHarness === undefined) {
    cachedHarness = {
      render: rntl.render as unknown as MatrixHarness['render'],
      fireEvent: rntl.fireEvent as unknown as FireEventLike,
    };
  }
  return cachedHarness;
}

function defaultThemeProvider(theme: TestThemeBundle['theme']): React.ComponentType<React.PropsWithChildren<unknown>> {
  const reference = new ThemeReference(theme);
  return function ThemeProviderShim({ children }) {
    return React.createElement(ThemeProvider, { theme: reference }, children);
  };
}

/**
 * Render a component across every derived state, driving any
 * interactions, and capture the resulting render / a11y / token
 * snapshots. The state matrix is derived from `metadata` via
 * `deriveComponentStates` — callers do not supply a hand-picked state
 * array.
 *
 * Errors raised while rendering or driving a state are caught and
 * attached to that state's `StateSnapshot.error`; subsequent states
 * still run.
 */
export async function runComponentMatrix<P>(
  Component: React.ComponentType<P>,
  metadata: ComponentMetadata,
  options: ComponentMatrixOptions = {},
): Promise<AnalyzerOutput<{ snapshots: StateSnapshot[]; issues: AnalyzerIssue[] }>> {
  const snapshots: StateSnapshot[] = [];
  const issues: AnalyzerIssue[] = [];

  const harness: MatrixHarness = options.harness ?? defaultHarness();
  const themeBundle = options.themeBundle;
  const ThemeWrapper =
    themeBundle === undefined ? undefined : (options.themeProvider ?? defaultThemeProvider)(themeBundle.theme);

  const derived = deriveComponentStates(metadata);
  for (const stateId of Object.keys(derived)) {
    const entry = derived[stateId];
    const snapshot = await renderOneState<P>(
      Component,
      metadata,
      stateId,
      entry,
      harness,
      themeBundle,
      ThemeWrapper,
      issues,
    );
    snapshots.push(snapshot);
  }

  return {
    component: metadata.name,
    generatedAt: new Date().toISOString(),
    data: { snapshots, issues },
  };
}

async function renderOneState<P>(
  Component: React.ComponentType<P>,
  metadata: ComponentMetadata,
  stateId: string,
  entry: ComponentStateEntry,
  harness: MatrixHarness,
  themeBundle: TestThemeBundle | undefined,
  ThemeWrapper: React.ComponentType<React.PropsWithChildren<unknown>> | undefined,
  issues: AnalyzerIssue[],
): Promise<StateSnapshot> {
  const baseProps = metadata.baseProps ?? {};
  const stateProps = entry.props ?? {};
  const props = { ...baseProps, ...stateProps } as unknown as React.PropsWithChildren<P>;

  let rendered: RenderResultLike | null = null;
  try {
    const element = React.createElement(Component, props);
    const wrapped = ThemeWrapper ? React.createElement(ThemeWrapper, null, element) : element;
    rendered = harness.render(wrapped);
    await act(async () => { /* flush pending effects */ });
  } catch (err) {
    return failure(stateId, entry, issues, 'component/render-error', `state '${stateId}' failed to render: ${describeError(err)}`);
  }

  try {
    if (entry.interactions !== undefined) {
      for (const interaction of entry.interactions) {
        await act(async () => {
          runInteraction(interaction, rendered!, harness);
        });
      }
    }
  } catch (err) {
    safeUnmount(rendered);
    return failure(
      stateId,
      entry,
      issues,
      'component/interaction-error',
      `state '${stateId}' failed mid-interaction: ${describeError(err)}`,
    );
  }

  let renderTree: RenderNode | null = null;
  try {
    renderTree = normalizeRenderTree((rendered!).toJSON());
  } catch (err) {
    safeUnmount(rendered);
    return failure(stateId, entry, issues, 'component/capture-error', `state '${stateId}' could not be captured: ${describeError(err)}`);
  }

  let a11yTree: A11yNode | null = null;
  if (renderTree !== null) {
    try {
      a11yTree = extractA11yTree(renderTree);
    } catch (err) {
      issues.push({
        severity: 'error',
        rule: 'component/a11y-extraction-error',
        message: `state '${stateId}' a11y extraction failed: ${describeError(err)}`,
      });
    }
  }

  let tokenMap: ComponentTokenMap | undefined;
  if (themeBundle !== undefined && renderTree !== null) {
    try {
      tokenMap = buildTokenMap(renderTree, themeBundle);
    } catch (err) {
      issues.push({
        severity: 'error',
        rule: 'component/token-mapping-error',
        message: `state '${stateId}' token mapping failed: ${describeError(err)}`,
      });
    }
  }

  safeUnmount(rendered);

  const snapshot: StateSnapshot = { stateId, entry, renderTree, a11yTree };
  if (tokenMap !== undefined) {
    snapshot.tokenMap = tokenMap;
  }
  return snapshot;
}

function buildTokenMap(renderTree: RenderNode, bundle: TestThemeBundle): ComponentTokenMap {
  const extracted = extractStyles(renderTree);
  const slots = extracted.map((node) => {
    const entries = resolveStyleToTokens(node.style, bundle.registry);
    const slot: ComponentTokenMap['slots'][number] = {
      path: node.path,
      type: node.type,
      entries,
    };
    if (node.testID !== undefined) {
      slot.testID = node.testID;
    }
    return slot;
  });
  return { slots };
}

function runInteraction(
  interaction: ComponentInteraction,
  rendered: RenderResultLike,
  harness: MatrixHarness,
): void {
  if (interaction.kind === 'custom') {
    return;
  }

  const target = rendered.getByTestId(interaction.targetTestID);

  switch (interaction.kind) {
    case 'press':
      harness.fireEvent.press(target);
      return;
    case 'focus':
      harness.fireEvent(target, 'focus');
      return;
    case 'blur':
      harness.fireEvent(target, 'blur');
      return;
    case 'hover':
      harness.fireEvent(target, interaction.state === 'in' ? 'hoverIn' : 'hoverOut');
      return;
    case 'changeText':
      harness.fireEvent.changeText(target, interaction.text);
      return;
    case 'scroll':
      harness.fireEvent.scroll(target, {
        nativeEvent: { contentOffset: interaction.offset },
      });
      return;
  }
}

function failure(
  stateId: string,
  entry: ComponentStateEntry,
  issues: AnalyzerIssue[],
  rule: string,
  message: string,
): StateSnapshot {
  const error: AnalyzerIssue = { severity: 'error', rule, message };
  issues.push(error);
  return { stateId, entry, renderTree: null, a11yTree: null, error };
}

function safeUnmount(rendered: RenderResultLike | null): void {
  if (rendered === null) {
    return;
  }
  try {
    rendered.unmount();
  } catch {
    /* swallowed: unmount errors aren't actionable */
  }
}

function describeError(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
