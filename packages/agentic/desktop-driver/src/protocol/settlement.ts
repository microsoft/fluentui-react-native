/**
 * What a native provider can establish about whether a mutating command changed application or input state:
 *
 * - `none`: nothing externally visible was dispatched.
 * - `applied`: the command's change was delivered.
 * - `partial`: some steps of a multi-step change were delivered and the rest were not.
 * - `unknown`: a change may have been dispatched and its result was not observed.
 *
 * Absence is treated as `unknown`, so providers that do not report an effect fail closed.
 */
export type MutationEffect = 'applied' | 'none' | 'partial' | 'unknown';

/**
 * Caller-facing result of a mutating operation after dispatch. It says nothing about whether an application
 * assertion passed; a delivered click is `applied` even when the UI did not react.
 */
export type MutationDisposition = 'applied' | 'indeterminate' | 'rejected';

const mutationEffects: ReadonlySet<string> = new Set<MutationEffect>(['applied', 'none', 'partial', 'unknown']);

type EffectCarrier = { effect?: MutationEffect };

export function parseMutationEffect(value: unknown): MutationEffect | undefined {
  return typeof value === 'string' && mutationEffects.has(value) ? (value as MutationEffect) : undefined;
}

/** Records on a failure what is known about the mutation it interrupted. An undefined effect leaves the failure unannotated. */
export function attachFailureEffect<T extends Error>(error: T, effect: MutationEffect | undefined): T {
  if (effect !== undefined) {
    (error as T & EffectCarrier).effect = effect;
  }
  return error;
}

/** Returns the recorded effect of a failed mutation, or undefined when the failure cannot rule an effect in or out. */
export function readFailureEffect(error: unknown): MutationEffect | undefined {
  return error instanceof Error ? parseMutationEffect((error as EffectCarrier).effect) : undefined;
}

export function dispositionForEffect(effect: MutationEffect | undefined): MutationDisposition {
  switch (effect) {
    case 'applied':
      return 'applied';
    case 'none':
      return 'rejected';
    default:
      return 'indeterminate';
  }
}

/** Classifies a mutating operation's failure. An unannotated failure is indeterminate. */
export function dispositionOfFailure(error: unknown): MutationDisposition {
  return dispositionForEffect(readFailureEffect(error));
}

/** What the driver tells a caller about a mutating operation that failed. */
export type MutationReport = {
  disposition: MutationDisposition;
  effect: MutationEffect;
  /** True when the failure left the target quarantined. */
  quarantined: boolean;
};

type ReportCarrier = { mutation?: MutationReport };

export function createMutationReport(error: unknown, quarantined: boolean): MutationReport {
  const effect = readFailureEffect(error) ?? 'unknown';
  return { disposition: dispositionForEffect(effect), effect, quarantined };
}

export function attachMutationReport<T extends Error>(error: T, report: MutationReport): T {
  (error as T & ReportCarrier).mutation = report;
  return error;
}

export function readMutationReport(error: unknown): MutationReport | undefined {
  return error instanceof Error ? (error as ReportCarrier).mutation : undefined;
}

type ProviderQuarantineCarrier = { providerQuarantined?: true };

/**
 * Marks a failure raised by a provider that quarantined itself, so the service quarantines the target to match even
 * when the failure was a refusal that dispatched nothing.
 */
export function attachProviderQuarantine<T extends Error>(error: T): T {
  (error as T & ProviderQuarantineCarrier).providerQuarantined = true;
  return error;
}

export function readProviderQuarantine(error: unknown): boolean {
  return error instanceof Error && (error as ProviderQuarantineCarrier).providerQuarantined === true;
}
