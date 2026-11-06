import type { DesktopServiceReadyRecord } from './processControl.js';

export type DesktopResourceServiceReadyRecord = Readonly<DesktopServiceReadyRecord>;

export type DesktopResourceOwnership = 'owned' | 'borrowed';

export type DesktopResourceReadiness = 'pending' | 'ready' | 'failed';

export type DesktopResourceDisposal = 'pending' | 'settled' | 'failed' | 'not-owned';

export type DesktopResourceRecord = Readonly<{
  id: string;
  identity: string;
  generation: number;
  ownership: DesktopResourceOwnership;
  readiness: DesktopResourceReadiness;
  disposal: DesktopResourceDisposal;
  serviceReady?: DesktopResourceServiceReadyRecord;
}>;

export type DesktopResourcePlan = {
  identity: string;
  acquire(signal: AbortSignal): Promise<void | DesktopResourceServiceReadyRecord>;
  /** Resolves only after every effect of this resource has settled. */
  dispose(): Promise<void>;
};

export type DesktopResourceContext = {
  signal: AbortSignal;
  targetId: string;
  targetInstanceId: string;
};

export type DesktopResourceContribution = {
  id: string;
  dependsOn?: readonly string[];
  ownership: DesktopResourceOwnership;
  /** Must be side-effect-free; the returned cleanup is registered before acquire() runs. */
  prepare(context: DesktopResourceContext): DesktopResourcePlan;
};

export function orderDesktopResourceContributions(value: unknown): readonly DesktopResourceContribution[] {
  if (!Array.isArray(value)) throw new TypeError('Desktop resource contributions must be an array.');
  const contributions = new Map<string, DesktopResourceContribution>();
  for (const [index, raw] of value.entries()) {
    validateContribution(raw, index);
    if (contributions.has(raw.id)) throw new TypeError(`Duplicate resource contribution "${raw.id}".`);
    const dependencies = raw.dependsOn ?? [];
    if (new Set(dependencies).size !== dependencies.length) throw new TypeError(`Resource "${raw.id}" has duplicate dependencies.`);
    contributions.set(raw.id, raw);
  }

  const ordered: DesktopResourceContribution[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string, ancestry: readonly string[]) => {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new TypeError(`Desktop resource dependency cycle: ${[...ancestry, id].join(' -> ')}.`);
    const contribution = contributions.get(id);
    if (!contribution) throw new TypeError(`Unknown desktop resource dependency "${id}".`);
    visiting.add(id);
    for (const dependency of contribution.dependsOn ?? []) visit(dependency, [...ancestry, id]);
    visiting.delete(id);
    visited.add(id);
    ordered.push(contribution);
  };
  for (const id of contributions.keys()) visit(id, []);
  return ordered;
}

export function validateDesktopResourcePlan(value: unknown, id: string): asserts value is DesktopResourcePlan {
  const plan = object(value, `resource "${id}" plan`);
  keys(plan, ['identity', 'acquire', 'dispose'], `resource "${id}" plan`);
  text(plan.identity, `resource "${id}" identity`);
  if (typeof plan.acquire !== 'function') throw new TypeError(`Resource "${id}" plan must expose acquire().`);
  if (typeof plan.dispose !== 'function') throw new TypeError(`Resource "${id}" plan must expose settled dispose().`);
}

export function validateDesktopResourceServiceReady(value: unknown): asserts value is DesktopResourceServiceReadyRecord {
  const ready = object(value, 'service readiness');
  keys(ready, ['tier', 'service', 'descriptor', 'incarnation', 'processId'], 'service readiness');
  if (ready.tier !== 'service-ready') throw new TypeError('Only service-ready readiness is supported.');
  text(ready.service, 'service readiness service');
  if (ready.descriptor !== undefined) text(ready.descriptor, 'service readiness descriptor');
  text(ready.incarnation, 'service readiness incarnation');
  if (typeof ready.processId !== 'number' || !Number.isSafeInteger(ready.processId) || ready.processId < 1) {
    throw new TypeError('Service readiness processId must be a positive safe integer.');
  }
}

function validateContribution(value: unknown, index: number): asserts value is DesktopResourceContribution {
  const contribution = object(value, `resource contribution ${index}`);
  keys(contribution, ['id', 'dependsOn', 'ownership', 'prepare'], `resource contribution ${index}`);
  text(contribution.id, `resource contribution ${index}.id`);
  if (contribution.ownership !== 'owned' && contribution.ownership !== 'borrowed') {
    throw new TypeError(`Resource "${contribution.id}" ownership must be owned or borrowed.`);
  }
  if (typeof contribution.prepare !== 'function') throw new TypeError(`Resource "${contribution.id}" must expose prepare().`);
  if (
    contribution.dependsOn !== undefined &&
    (!Array.isArray(contribution.dependsOn) || !contribution.dependsOn.every((dependency) => typeof dependency === 'string'))
  ) {
    throw new TypeError(`Resource "${contribution.id}" dependencies must be an array of IDs.`);
  }
}

function object(value: unknown, context: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${context} must be an object.`);
  return value as Record<string, unknown>;
}

function keys(value: Record<string, unknown>, allowed: readonly string[], context: string): void {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new TypeError(`Unknown ${context} field "${key}".`);
}

function text(value: unknown, context: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.includes('\0')) {
    throw new TypeError(`${context} must be a nonempty string without NUL.`);
  }
}
