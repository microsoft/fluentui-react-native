import {
  missingDesktopRequirements,
  resolveDesktopClickMode,
  unmaskedAccessibleFeatures,
} from '@fluentui-react-native/desktop-driver/authoring';
import { desktopSpecIdentifier } from './registry.js';
import type { DesktopJasmineRegistry } from './registry.js';

type JasmineNode = { id?: unknown; description?: unknown; children?: readonly JasmineNode[] };
type JasmineSpecFilter = (spec: unknown) => boolean;

/** The part of Jasmine's environment that applying a selection needs. */
export type DesktopJasmineEnvironment = {
  configuration(): { specFilter?: JasmineSpecFilter };
  configure(configuration: { specFilter: JasmineSpecFilter }): void;
  topSuite(): JasmineNode;
};

/** The environment of the Jasmine this process runs under, if a framework installed one. */
export function currentDesktopJasmineEnvironment(): DesktopJasmineEnvironment | undefined {
  const jasmine = (globalThis as { jasmine?: { getEnv?: () => DesktopJasmineEnvironment } }).jasmine;
  return jasmine?.getEnv?.();
}

const listedSpecs = 10;

/**
 * Applies a run's selection once the spec files have registered their tests and the host is known, before any test runs.
 *
 * A fault that makes the selection untrustworthy disables every spec and throws, so a lane never executes a test it cannot
 * vouch for. Otherwise, a test whose requirements the host cannot meet is excluded here and reported as unsupported.
 */
export function selectDesktopSpecs(
  registry: DesktopJasmineRegistry,
  environment: DesktopJasmineEnvironment | undefined,
  features: unknown,
  inputMode?: unknown,
): void {
  const lane = registry.selection?.lane;
  const problems = [...registry.errors];
  // The driver refuses what the lane's policy forbids only when the session confirmed that policy.
  if (lane && inputMode !== lane) {
    problems.push(
      `The ${lane} input lane needs a session that enforces the ${lane} input policy, and the driver reported ${typeof inputMode === 'string' ? inputMode : 'none'}.`,
    );
  }
  if (lane === 'accessible') {
    const unmasked = unmaskedAccessibleFeatures(features);
    if (unmasked.length > 0) {
      problems.push(`The accessible input lane needs a host that reports ${unmasked.join(', ')} disabled, and this one does not.`);
    }
  }
  if (lane) {
    const undeclared = environment ? undeclaredSpecs(registry, environment) : undefined;
    if (!undeclared) problems.push('Jasmine did not expose its environment, so the specs of an input lane cannot be verified.');
    else if (undeclared.length > 0) {
      const listed = undeclared.slice(0, listedSpecs).join(', ');
      const more = undeclared.length > listedSpecs ? ` and ${undeclared.length - listedSpecs} more` : '';
      problems.push(
        `An input lane runs only declared tests, but ${undeclared.length} ${undeclared.length === 1 ? 'spec was' : 'specs were'} not declared with desktopIt or desktopDescribe: ${listed}${more}.`,
      );
    }
  }
  if (problems.length > 0) {
    registry.blocked = true;
    environment?.configure({ specFilter: () => false });
    throw new Error(problems.join('\n'));
  }
  if (!environment) return;
  // The session's click mode is the lane's, so this is what a `click` requirement would really do.
  const clickMode = resolveDesktopClickMode(undefined, 'auto', lane);
  const unavailable = new Set<string>();
  for (const [identifier, entry] of registry.entries) {
    if (entry.kind !== 'run') continue;
    const missing = missingDesktopRequirements(entry.descriptor, features as Readonly<Record<string, unknown>> | undefined, clickMode);
    if (missing.length === 0) continue;
    entry.missing = missing;
    unavailable.add(identifier);
  }
  if (unavailable.size === 0) return;
  const configured = environment.configuration().specFilter;
  // A filtered spec is excluded before Jasmine runs its hooks, which an executed-then-skipped spec could not avoid.
  environment.configure({
    specFilter: (spec) => {
      const identifier = desktopSpecIdentifier(spec as { description?: unknown; id?: unknown });
      return !(identifier !== undefined && unavailable.has(identifier)) && (configured?.(spec) ?? true);
    },
  });
}

/** The full names of the specs no `desktopIt` registered. */
function undeclaredSpecs(registry: DesktopJasmineRegistry, environment: DesktopJasmineEnvironment): string[] {
  const undeclared: string[] = [];
  const visit = (node: JasmineNode, path: readonly string[]) => {
    for (const child of node.children ?? []) {
      const names = [...path, String(child.description)];
      if (child.children) visit(child, names);
      else if (!registry.entries.has(desktopSpecIdentifier(child) ?? '')) undeclared.push(`"${names.join(' ')}"`);
    }
  };
  visit(environment.topSuite(), []);
  return undeclared;
}
