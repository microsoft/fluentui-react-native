import type { DesktopEndpoint } from '../protocol/types.js';
import { matchesDesktopPlatforms, matchesDesktopScope } from './input.js';
import type { DesktopInputLane, DesktopRequirement, DesktopScopeDomains, DesktopScopeValues, ResolvedDesktopCaseOptions } from './input.js';

/** Why a declared case is not part of a run. Excluded cases are not tests, so they are counted and never reported as skipped. */
export type DesktopExclusionReason = 'platform' | 'scope' | 'input';

/** A gap the author declared in advance. The case is selected and reported as unsupported, not executed. */
export type DesktopDeclaredGap = { kind: 'unsupported' | 'quarantine'; reason: string };

/** What a case is judged against: the endpoint and scope values of the target, and the input lane of the run if it has one. */
export type DesktopCaseTarget = {
  endpoint: DesktopEndpoint;
  lane?: DesktopInputLane;
  domains: DesktopScopeDomains;
  values: DesktopScopeValues;
  /** Clock for quarantine expiry. */
  now?: number;
};

export type DesktopCaseDecision =
  | { kind: 'excluded'; reason: DesktopExclusionReason }
  | { kind: 'gap'; gap: DesktopDeclaredGap }
  | { kind: 'run' };

/**
 * Decides one declared case before it executes. The first applicable reason wins, in platform, scope, input order, so a
 * case never counts against two exclusions. A declared gap is resolved here too, which is why an expired quarantine
 * stops the run before anything executes.
 */
export function decideDesktopCase(descriptor: ResolvedDesktopCaseOptions, target: DesktopCaseTarget, source: string): DesktopCaseDecision {
  if (!matchesDesktopPlatforms(descriptor.platforms, target.endpoint)) return { kind: 'excluded', reason: 'platform' };
  if (!matchesDesktopScope(descriptor.scope, target.values, target.domains, `${source} scope`))
    return { kind: 'excluded', reason: 'scope' };
  if (target.lane && descriptor.input !== 'both' && descriptor.input !== target.lane) return { kind: 'excluded', reason: 'input' };
  const gap = declaredGap(descriptor, target);
  return gap ? { kind: 'gap', gap } : { kind: 'run' };
}

/** How a session turns a click into input. `auto` lets the host pick; the other two pin one transport. */
export type DesktopCaseClickMode = 'auto' | 'physical' | 'accessibility';

/**
 * The click mode a case runs under. A lane decides it outright, so a `click` requirement is an accessible click in the
 * accessible lane and a physical click in the physical lane. Without a lane only an accessible case pins its transport,
 * so it never moves the pointer. Any other case keeps the configured mode: a physical case on a host that masks physical
 * click is then reported unsupported by the requirement preflight, as the skip it replaces was, instead of failing to
 * create its session.
 */
export function resolveDesktopClickMode(
  descriptor: ResolvedDesktopCaseOptions | undefined,
  configured: DesktopCaseClickMode,
  lane: DesktopInputLane | undefined,
): DesktopCaseClickMode {
  if (lane === 'accessible') return 'accessibility';
  if (lane === 'physical') return 'physical';
  if (descriptor?.input === 'accessible' || descriptor?.requires?.includes('accessibility-click')) return 'accessibility';
  return configured;
}

/** The requirements a host cannot meet. `features` is what the host reported for the session; an absent report meets nothing. */
export function missingDesktopRequirements(
  descriptor: ResolvedDesktopCaseOptions | undefined,
  features: Readonly<Record<string, unknown>> | undefined,
  clickMode: DesktopCaseClickMode,
): DesktopRequirement[] {
  if (!descriptor?.requires?.length) return [];
  const missing: DesktopRequirement[] = [];
  for (const requirement of descriptor.requires) {
    if (requirement === 'click') {
      const met =
        clickMode === 'physical'
          ? features?.physicalClick === true
          : clickMode === 'accessibility'
            ? features?.accessibilityClick === true
            : features?.physicalClick === true || features?.accessibilityClick === true;
      if (!met) missing.push(requirement);
    } else if (features?.[requirementFeature[requirement]] !== true) {
      missing.push(requirement);
    }
  }
  return missing;
}

/** The host feature that backs each requirement other than `click`, which depends on the click mode. */
const requirementFeature: Record<Exclude<DesktopRequirement, 'click'>, string> = {
  'accessibility-actions': 'accessibilityActions',
  'accessibility-click': 'accessibilityClick',
  'element-screenshot': 'elementScreenshot',
  focus: 'focus',
  keyboard: 'keyboard',
  'physical-click': 'physicalClick',
  screenshot: 'screenshot',
  'set-window-rect': 'setWindowRect',
  wheel: 'wheel',
};

function declaredGap(
  descriptor: ResolvedDesktopCaseOptions,
  { endpoint, lane, now = Date.now() }: DesktopCaseTarget,
): DesktopDeclaredGap | undefined {
  if (descriptor.unsupported && matchesDesktopPlatforms(descriptor.unsupported.platforms, endpoint)) {
    return { kind: 'unsupported', reason: descriptor.unsupported.reason };
  }
  const quarantine = descriptor.quarantine;
  if (
    quarantine &&
    (!quarantine.platforms || matchesDesktopPlatforms(quarantine.platforms, endpoint)) &&
    (!quarantine.input || quarantine.input === lane)
  ) {
    if (Date.parse(`${quarantine.expires}T00:00:00Z`) < now)
      throw new Error(`Quarantine ${quarantine.issue} expired on ${quarantine.expires}.`);
    return { kind: 'quarantine', reason: `${quarantine.issue}: ${quarantine.reason}` };
  }
  return undefined;
}
