import type {
  DesktopDeclaredGap,
  DesktopExclusionReason,
  DesktopRequirement,
  ResolvedDesktopCaseOptions,
} from '@fluentui-react-native/desktop-driver/authoring';
import type { SelectionExclusions } from '../reporting/protocol.js';
import { desktopTestSelectionEnvironment, parseDesktopTestSelection } from './selection.js';
import type { DesktopTestSelection } from './selection.js';

/** What the adapter decided for a spec it registered. */
export type DesktopSpecEntry =
  /** Executes, unless a preflight found that the host cannot meet what it requires. */
  | { kind: 'run'; descriptor: ResolvedDesktopCaseOptions; missing?: readonly DesktopRequirement[] }
  /** Registered as a placeholder that never runs and is counted, not reported as a test. */
  | { kind: 'excluded'; reason: DesktopExclusionReason }
  /** Registered as a placeholder that is reported as unsupported, with the reason its author gave. */
  | { kind: 'gap'; gap: DesktopDeclaredGap }
  /** A failing spec the adapter registered in place of a declaration it could not accept. */
  | { kind: 'invalid' };

/** What one worker process learned while its spec files registered their tests. */
export type DesktopJasmineRegistry = {
  /** Absent when no desktop-test run started this process, in which case declarations are only validated. */
  readonly selection: DesktopTestSelection | undefined;
  /** Keyed by the identifier WDIO reports for a spec: its description followed by its Jasmine id. */
  readonly entries: Map<string, DesktopSpecEntry>;
  /** The enclosing `desktopDescribe` options while a group body registers, innermost last. */
  readonly groups: ResolvedDesktopCaseOptions[];
  /** Faults that make the selection untrustworthy, such as a spec the adapter could not identify. */
  readonly errors: string[];
  /** Set once every spec was disabled because of a fault, so the reporter shows the fault instead of a wall of skips. */
  blocked: boolean;
};

const registryKey = Symbol.for('@fluentui-react-native/desktop-test/jasmine-registry');

/**
 * The registry of this process. It lives on `globalThis` because the spec files and the reporter share one worker process
 * but may load this module through different paths, such as source and its build.
 */
export function desktopJasmineRegistry(environment: NodeJS.ProcessEnv = process.env): DesktopJasmineRegistry {
  const holder = globalThis as { [registryKey]?: DesktopJasmineRegistry };
  return (holder[registryKey] ??= createDesktopJasmineRegistry(environment));
}

export function createDesktopJasmineRegistry(environment: NodeJS.ProcessEnv = {}): DesktopJasmineRegistry {
  const errors: string[] = [];
  let selection: DesktopTestSelection | undefined;
  const raw = environment[desktopTestSelectionEnvironment];
  if (raw !== undefined) {
    try {
      selection = parseDesktopTestSelection(raw);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return { selection, entries: new Map(), groups: [], errors, blocked: false };
}

/** The identifier WDIO's Jasmine adapter reports for a spec, so the reporter can find what the adapter decided. */
export function desktopSpecIdentifier(spec: { description?: unknown; id?: unknown } | undefined): string | undefined {
  return typeof spec?.description === 'string' && typeof spec.id === 'string' ? `${spec.description}${spec.id}` : undefined;
}

export function excludedSpecCounts(registry: DesktopJasmineRegistry): SelectionExclusions {
  const excluded = { platform: 0, scope: 0, input: 0 };
  for (const entry of registry.entries.values()) {
    if (entry.kind === 'excluded') excluded[entry.reason]++;
  }
  return excluded;
}
