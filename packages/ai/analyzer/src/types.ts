/**
 * Shared types for the analyzer package.
 *
 * These types form the public contract between the analyzer areas
 * (`tree`, `theme`, `a11y`, `component`) and any downstream consumers.
 * Names and shapes here are intentionally stable — multiple parallel
 * briefs depend on importing these without modification.
 */

/**
 * A normalized node from `react-test-renderer`'s `toJSON()` output.
 *
 * String children represent literal text in the rendered tree (e.g.,
 * the body of a `<Text>` element); object children are nested nodes.
 *
 * Note: `react-test-renderer`'s `toJSON()` returns `null` for empty
 * trees and `(ReactTestRendererJSON | string)` for children. This
 * interface keeps the same shape but narrows `null` away — analyzers
 * should guard against the empty case before walking.
 */
export interface RenderNode {
  /** Element type, e.g. `'View'`, `'Text'`, `'RCTView'`. */
  type: string;
  /** Props recorded on the element by the renderer. */
  props: Record<string, unknown>;
  /** Ordered children — either nested nodes or raw string content. */
  children: readonly (RenderNode | string)[];
}

/**
 * A path through the rendered tree, used to refer to a specific slot
 * or element inside a snapshot.
 *
 * String segments name logical slots (e.g. `'root'`, `'content'`);
 * numeric segments are child indices produced by `walkTree`. Most
 * analyzers operate purely in index space, but the union allows
 * higher-level tools (theme, a11y) to label paths with slot names.
 *
 * The empty array `[]` always refers to the root node.
 */
export type SlotPath = readonly (string | number)[];

/**
 * Standard envelope every analyzer utility returns. Generic over the
 * specific payload `T` so each area (theme/a11y/component) can attach
 * its own data while sharing identity and timing metadata.
 */
export interface AnalyzerOutput<T> {
  /** Component display name (e.g., `'ButtonV1'`). */
  component: string;
  /** Optional variant label, such as `'disabled'` or `'pressed'`. */
  variant?: string;
  /** ISO-8601 timestamp captured when the output was produced. */
  generatedAt: string;
  /** Area-specific payload. */
  data: T;
}

/**
 * A single issue reported by an analyzer rule. Issues are normalized
 * across areas so reporting and review tooling can consume them
 * uniformly.
 */
export interface AnalyzerIssue {
  /** Severity level — higher severities should fail review gates. */
  severity: 'error' | 'warning' | 'info';
  /**
   * Stable rule identifier, namespaced by area. Examples:
   * `'a11y/missing-label'`, `'theme/unmapped-token'`.
   * Treat these as stable IDs — downstream tools may key suppression
   * configuration off them.
   */
  rule: string;
  /** Human-readable description of the problem. */
  message: string;
  /** Optional path into the rendered tree where the issue was found. */
  path?: SlotPath;
}
