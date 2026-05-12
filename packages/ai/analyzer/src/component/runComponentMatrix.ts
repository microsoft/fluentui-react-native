import * as React from 'react';
import { act } from 'react';
import * as rntl from '@testing-library/react-native';
import { ThemeProvider, ThemeReference } from '@fluentui-react-native/theme';

import type { AnalyzerIssue, AnalyzerOutput, RenderNode } from '../types.ts';
import { extractA11yTree, type A11yNode } from '../a11y/index.ts';
import { normalizeRenderTree } from '../tree/index.ts';
import {
  extractStyles,
  resolveStyleToTokens,
  type ComponentTokenMap,
  type TestThemeBundle,
} from '../theme/index.ts';
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
   * Optional `ThemeProvider` factory. Defaults to the real
   * `ThemeProvider` from `@fluentui-react-native/theme` wrapped around
   * a `ThemeReference`. Tests can inject a stub factory to avoid the
   * runtime dependency.
   */
  themeProvider?: ThemeProviderFactory;
  /**
   * Test-only injection point for the render harness. Not part of the
   * public API; exposed so unit tests can run against a deterministic
   * fake instead of `@testing-library/react-native`.
   */
  harness?: MatrixHarness;
}

/**
 * Shape of the `@fluentui-react-native/theme` provider, narrowed to the
 * pieces this driver uses. The default factory builds a real
 * `ThemeReference` around the bundle's theme; tests can substitute a
 * full-fledged wrapper if they need something different.
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
 * Cached handle to the testing-library harness. Importing the main
 * entry registers cleanup hooks (afterEach/afterAll) only when those
 * globals exist — so it's safe to import from non-test code (hooks
 * simply don't register). We cache the resolved harness so every
 * `runComponentMatrix` call reuses the same `{ render, fireEvent }` pair.
 */
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

/**
 * Default factory for the FluentUI `ThemeProvider`. Uses the real
 * `ThemeReference` from `@fluentui-react-native/theme` as its wrapper —
 * the provider's change-notifier hooks are part of the contract, and
 * `ThemeReference` implements them properly (no-op for immutable test
 * themes, real notifiers if a test chooses to drive a theme change).
 */
function defaultThemeProvider(theme: TestThemeBundle['theme']): React.ComponentType<React.PropsWithChildren<unknown>> {
  const reference = new ThemeReference(theme);
  return function ThemeProviderShim({ children }) {
    return React.createElement(ThemeProvider, { theme: reference }, children);
  };
}

/**
 * Render a component across every state in its metadata, driving any
 * declared interactions, and capture the resulting render / a11y /
 * token snapshots.
 *
 * The function is `async` because React's effects (`{useEffect}` and
 * `{useLayoutEffect}`) have to flush inside `act()` — else the captured
 * render tree reflects the pre-effect state. Most composition-framework
 * components use effects internally, so the driver `await act(async ...)`
 * around each render and interaction.
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
): Promise<AnalyzerOutput<{ snapshots: StateSnapshot[]; issues: AnalyzerIssue[] }>> {
  const snapshots: StateSnapshot[] = [];
  const issues: AnalyzerIssue[] = [];

  const harness: MatrixHarness = options.harness ?? defaultHarness();
  const themeBundle = options.themeBundle;
  const ThemeWrapper =
    themeBundle === undefined ? undefined : (options.themeProvider ?? defaultThemeProvider)(themeBundle.theme);

  for (const state of metadata.states) {
    const snapshot = await renderOneState<P>(Component, metadata, state, harness, themeBundle, ThemeWrapper, issues);
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
  state: ComponentStateSpec,
  harness: MatrixHarness,
  themeBundle: TestThemeBundle | undefined,
  ThemeWrapper: React.ComponentType<React.PropsWithChildren<unknown>> | undefined,
  issues: AnalyzerIssue[],
): Promise<StateSnapshot> {
  const stateLabel = state.id;
  const baseProps = metadata.baseProps ?? {};
  const stateProps = state.props ?? {};
  const props = { ...baseProps, ...stateProps } as unknown as React.PropsWithChildren<P>;

  let rendered: RenderResultLike | null = null;
  try {
    const element = React.createElement(Component, props);
    const wrapped = ThemeWrapper ? React.createElement(ThemeWrapper, null, element) : element;
    rendered = harness.render(wrapped);
    // testing-library's render calls act() internally, but composition-
    // framework components use `useEffect` for state resolution; flush a
    // second round to make sure the post-effect tree is what we capture.
    await act(async () => { /* flush pending effects */ });
  } catch (err) {
    return failure(state, issues, 'component/render-error', `state '${stateLabel}' failed to render: ${describeError(err)}`);
  }

  try {
    if (state.interactions !== undefined) {
      for (const interaction of state.interactions) {
        await act(async () => {
          runInteraction(interaction, rendered!, harness);
        });
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
    renderTree = normalizeRenderTree((rendered!).toJSON());
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
