import * as React from 'react';

import type { AnalyzerIssue, AnalyzerOutput, RenderNode } from '../types.ts';
import { extractA11yTree, type A11yNode } from '../a11y/index.ts';
import {
  extractStyles,
  resolveStyleToTokens,
  type ComponentTokenMap,
  type TestThemeBundle,
} from '../theme/index.ts';

import { normalizeRenderTree } from './normalizeTree.ts';
import type { ComponentInteraction, ComponentMetadata, ComponentStateSpec } from './ComponentMetadata.ts';

/**
 * One slice of the component matrix: a single state rendered, driven by
 * its interactions, and snapshotted. The `error` field, when present,
 * indicates the analyzer failed mid-state — the other fields may be
 * partial in that case.
 */
export interface StateSnapshot {
  /** The state spec this snapshot was produced for. */
  state: ComponentStateSpec;
  /** Normalized rendered tree captured after interactions ran. */
  renderTree: RenderNode | null;
  /** Accessibility tree extracted from `renderTree`. */
  a11yTree: A11yNode | null;
  /**
   * Per-slot token usage map. Populated only when `themeBundle` was
   * supplied to `runComponentMatrix`. The shape mirrors the theme
   * area's `ComponentTokenMap`.
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
 * Options for `runComponentMatrix`.
 *
 * Supply `themeBundle` to (a) wrap every render with the test theme and
 * (b) record a per-state token map. The two go hand-in-hand: token
 * mapping reverse-engineers style values through the registry that the
 * bundle's theme was built against, so substituting a different theme
 * would invalidate the map.
 */
export interface ComponentMatrixOptions {
  /**
   * Optional test theme + registry bundle from `createTestTheme()`.
   * Without this, snapshots still capture render and a11y trees but
   * `tokenMap` is omitted, and the component is rendered without a
   * surrounding `ThemeProvider` (consumers must ensure the component
   * tolerates this — most FluentUI RN components do, but tokens that
   * resolve to `undefined` will show up as bare values in the tree).
   */
  themeBundle?: TestThemeBundle;
  /**
   * Optional `ThemeProvider` factory. Defaults to importing
   * `@fluentui-react-native/theme` lazily. Tests can inject a stub
   * factory to avoid the runtime dependency.
   */
  themeProvider?: ThemeProviderFactory;
}

/**
 * Shape of the `@fluentui-react-native/theme` provider, narrowed to the
 * pieces this driver uses. The real `ThemeReference` type carries
 * additional fields, but the provider only reads `theme` and the
 * change-notification callbacks — we synthesize a minimal reference
 * inline.
 */
export type ThemeProviderFactory = (theme: TestThemeBundle['theme']) => React.ComponentType<React.PropsWithChildren<unknown>>;

/**
 * Lightweight contract for the testing-library `render` API the matrix
 * driver relies on. Only the methods we touch live here so we can stub
 * them in tests without dragging the full testing-library type in.
 */
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

/**
 * Indirection points for the matrix driver. In production, `render` and
 * `fireEvent` come from `@testing-library/react-native`; this interface
 * exists so tests can inject deterministic fakes if needed.
 */
export interface MatrixHarness {
  render(element: React.ReactElement): RenderResultLike;
  fireEvent: FireEventLike;
}

/**
 * Default harness backed by `@testing-library/react-native`. Resolved
 * lazily so the analyzer can be imported in environments that don't
 * have testing-library installed (e.g., production bundles), and so
 * tests can supply their own harness.
 *
 * We pull from the `pure` entry point — the package's default `index`
 * registers a global `afterAll` hook at module load time, which only
 * works when imported at the top of a Jest test file. Loading
 * `pure` here keeps the analyzer usable outside of Jest's hook
 * lifecycle while still giving us `render` + `fireEvent`.
 */
function defaultHarness(): MatrixHarness {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rntl = require('@testing-library/react-native/pure') as {
    render: (element: React.ReactElement) => RenderResultLike;
    fireEvent: FireEventLike;
  };
  return { render: rntl.render, fireEvent: rntl.fireEvent };
}

/**
 * Default factory for the FluentUI `ThemeProvider`. Builds a minimal
 * `ThemeReference` around the supplied theme — the provider only reads
 * `theme` plus the add/remove change-notifier hooks, and our test
 * themes never change once built.
 */
function defaultThemeProvider(theme: TestThemeBundle['theme']): React.ComponentType<React.PropsWithChildren<unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const themePkg = require('@fluentui-react-native/theme') as {
    ThemeProvider: React.ComponentType<React.PropsWithChildren<{ theme: unknown }>>;
  };
  // The provider only ever reads `theme` and registers a change
  // listener; test themes are immutable, so the add/remove callbacks
  // can be no-ops. `noop` is hoisted so the lint rule against empty
  // function literals doesn't fire twice.
  const noop = (): void => undefined;
  const reference = {
    get theme() {
      return theme;
    },
    addOnThemeChanged: noop,
    removeOnThemeChanged: noop,
  };
  const Provider = themePkg.ThemeProvider;
  return function ThemeProviderShim({ children }) {
    return React.createElement(Provider, { theme: reference }, children);
  };
}

/**
 * Render a component across every state in its metadata, driving any
 * declared interactions, and capture the resulting render / a11y /
 * token snapshots.
 *
 * Errors raised while rendering or driving a state are caught and
 * attached to that state's `StateSnapshot.error`; subsequent states
 * still run. This mirrors the brief's rule that "if a state fails, the
 * result should surface the error against that state, not abort the
 * whole matrix."
 */
export async function runComponentMatrix<P>(
  Component: React.ComponentType<P>,
  metadata: ComponentMetadata,
  options: ComponentMatrixOptions = {},
  // Internal-only override; not part of the public API.
  harness: MatrixHarness = defaultHarness(),
): Promise<AnalyzerOutput<{ snapshots: StateSnapshot[]; issues: AnalyzerIssue[] }>> {
  const snapshots: StateSnapshot[] = [];
  const issues: AnalyzerIssue[] = [];

  const themeBundle = options.themeBundle;
  const ThemeWrapper =
    themeBundle === undefined ? undefined : (options.themeProvider ?? defaultThemeProvider)(themeBundle.theme);

  for (const state of metadata.states) {
    const snapshot = renderOneState<P>(Component, metadata, state, harness, themeBundle, ThemeWrapper, issues);
    snapshots.push(snapshot);
  }

  return {
    component: metadata.name,
    generatedAt: new Date().toISOString(),
    data: { snapshots, issues },
  };
}

function renderOneState<P>(
  Component: React.ComponentType<P>,
  metadata: ComponentMetadata,
  state: ComponentStateSpec,
  harness: MatrixHarness,
  themeBundle: TestThemeBundle | undefined,
  ThemeWrapper: React.ComponentType<React.PropsWithChildren<unknown>> | undefined,
  issues: AnalyzerIssue[],
): StateSnapshot {
  const stateLabel = state.id;
  const baseProps = metadata.baseProps ?? {};
  const stateProps = state.props ?? {};
  const props = { ...baseProps, ...stateProps } as unknown as React.PropsWithChildren<P>;

  let rendered: RenderResultLike | null = null;
  try {
    const element = React.createElement(Component, props);
    const wrapped = ThemeWrapper ? React.createElement(ThemeWrapper, null, element) : element;
    rendered = harness.render(wrapped);
  } catch (err) {
    return failure(state, issues, 'component/render-error', `state '${stateLabel}' failed to render: ${describeError(err)}`);
  }

  try {
    if (state.interactions !== undefined) {
      for (const interaction of state.interactions) {
        runInteraction(interaction, rendered, harness);
      }
    }
  } catch (err) {
    safeUnmount(rendered);
    return failure(
      state,
      issues,
      'component/interaction-error',
      `state '${stateLabel}' failed mid-interaction: ${describeError(err)}`,
    );
  }

  let renderTree: RenderNode | null = null;
  try {
    renderTree = normalizeRenderTree(rendered.toJSON());
  } catch (err) {
    safeUnmount(rendered);
    return failure(state, issues, 'component/capture-error', `state '${stateLabel}' could not be captured: ${describeError(err)}`);
  }

  let a11yTree: A11yNode | null = null;
  if (renderTree !== null) {
    try {
      a11yTree = extractA11yTree(renderTree);
    } catch (err) {
      issues.push({
        severity: 'error',
        rule: 'component/a11y-extraction-error',
        message: `state '${stateLabel}' a11y extraction failed: ${describeError(err)}`,
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
        message: `state '${stateLabel}' token mapping failed: ${describeError(err)}`,
      });
    }
  }

  safeUnmount(rendered);

  const snapshot: StateSnapshot = { state, renderTree, a11yTree };
  if (tokenMap !== undefined) {
    snapshot.tokenMap = tokenMap;
  }
  return snapshot;
}

/**
 * Per-slot token attribution for `renderTree`, built from the theme
 * area's lower-level primitives. We don't call
 * `mapComponentToTokens(renderer, registry)` directly because that API
 * takes a `ReactTestRenderer` instance; testing-library exposes a
 * `toJSON()`-shaped object instead, so we mirror what the high-level
 * helper does internally.
 */
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
    // No built-in semantics for custom interactions — they exist as an
    // extension point. Skipping is intentional; an agent wanting to
    // drive a real component-specific behaviour should add a typed
    // `kind` rather than rely on this branch.
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
      // Translates to FluentUI's pressable hover handler names. RN's
      // test renderer has no real hover state, but `usePressableState`
      // exposes `onHoverIn`/`onHoverOut`, which fireEvent drives by
      // the camelCased suffix.
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
  state: ComponentStateSpec,
  issues: AnalyzerIssue[],
  rule: string,
  message: string,
): StateSnapshot {
  const error: AnalyzerIssue = { severity: 'error', rule, message };
  issues.push(error);
  return { state, renderTree: null, a11yTree: null, error };
}

function safeUnmount(rendered: RenderResultLike | null): void {
  if (rendered === null) {
    return;
  }
  try {
    rendered.unmount();
  } catch {
    // Unmount errors aren't actionable here — the renderer is on its
    // way out anyway. Swallow rather than mask the real failure.
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
