import { z } from 'zod';

import type { NativeElementSnapshot } from '../host/types.js';
import { toWebDriverError } from '../protocol/errors.js';
import type { WebDriverError, WebDriverErrorCode } from '../protocol/errors.js';
import { attachFailureEffect, attachMutationReport, readMutationReport } from '../protocol/settlement.js';
import { operationError } from './envelope.js';
import { maxActionNameLength, maxTypedTextLength } from './limits.js';
import { requireBoundedObservation } from './policy.js';
import { matchesFingerprint } from './proofs.js';
import type { UniquenessProof } from './proofs.js';
import { referenceFailureError } from './refs.js';
import type { ReferenceEntry } from './refs.js';
import { registerOperation } from './runtime.js';
import type { OperationCapabilities, OperationRuntime } from './runtime.js';
import { flushLedger, interpretFailure } from './sampling.js';
import { searchSelector, selectorKeys, selectorSchema } from './selector.js';
import type { Selector } from './selector.js';
import { referenceSchema, sampleIdSchema, warningSchema } from './shapes.js';

/** How far up from a hit-tested element the check walks to find the target. Deeper nesting is reported as obscured. */
const maxHitAncestors = 64;

export const actionNames = ['click', 'activate', 'perform', 'type', 'clear'] as const;
export type ActionName = (typeof actionNames)[number];

/**
 * How the provider carried the action out. `physical-pointer` is a synthesized click at a hit-tested point,
 * `accessibility` is an accessibility action (the element's default one for `activate`, the named one for `perform`),
 * `keyboard` is synthesized key input to the focused element, and `provider` means the provider chose and did not say,
 * as `clear` does when it can set a value directly.
 */
export const actionMechanisms = ['physical-pointer', 'accessibility', 'keyboard', 'provider'] as const;
export type ActionMechanism = (typeof actionMechanisms)[number];

const mechanismOf: Record<ActionName, ActionMechanism> = {
  activate: 'accessibility',
  clear: 'provider',
  click: 'physical-pointer',
  perform: 'accessibility',
  type: 'keyboard',
};

export const actInput = z
  .strictObject({
    action: z
      .enum(actionNames)
      .describe(
        "click: a physical pointer click at the hit-tested centre. activate: the element's default accessibility action, no pointer. perform: the accessibility action named by name, no pointer. type: keyboard input after focusing. clear: empty the value.",
      ),
    find: selectorSchema.optional().describe('Instead of ref and sample: a selector a complete search, run now, must prove unique.'),
    name: z
      .string()
      .min(1)
      .max(maxActionNameLength)
      .optional()
      .describe("Only with perform: an action as observe's actions fact lists it. The element must publish exactly one by that name."),
    ref: referenceSchema.optional().describe('A reference from a find whose outcome was unique. Give sample with it.'),
    sample: sampleIdSchema.optional().describe('The sample id of that find, which proved the reference unique.'),
    text: z.string().min(1).max(maxTypedTextLength).optional().describe('Text to type. Only with type; never recorded.'),
  })
  .refine((input) => (input.action === 'type') === (input.text !== undefined), { message: 'Give text with type, and only with type.' })
  .refine((input) => (input.action === 'perform') === (input.name !== undefined), {
    message: 'Give name with perform, and only with perform.',
  })
  .refine(
    (input) =>
      input.find === undefined
        ? input.ref !== undefined && input.sample !== undefined
        : input.ref === undefined && input.sample === undefined,
    { message: 'Give ref with sample, or find, not both.' },
  )
  .describe('Name the element by ref with the sample that proved it unique, or by find.');

export type ActInput = z.input<typeof actInput>;

export const actOutput = z.strictObject({
  action: z.enum(actionNames),
  disposition: z.literal('applied').describe('The provider reported the action done. A failure says whether anything landed.'),
  mechanism: z.enum(actionMechanisms).describe('How the action was carried out. Semantic activation is never physical input.'),
  ref: z.string(),
  sample: z.string().describe('The sample that proved the element unique; cite it with ref to act on the element again.'),
  warnings: z.array(warningSchema).optional(),
  window: z.string(),
});

export type ActResult = z.infer<typeof actOutput>;
export type ActOptions = z.output<typeof actInput>;

const requiredCapability: Partial<Record<ActionName, keyof OperationCapabilities>> = {
  activate: 'accessibilityClick',
  click: 'physicalClick',
  perform: 'accessibilityActions',
  type: 'keyboard',
};

/** A failure before anything was dispatched: a settled rejection the caller may retry with a new request id. */
export function rejection(runtime: OperationRuntime, code: WebDriverErrorCode, reason: string, message: string): WebDriverError {
  return asRejection(runtime, operationError(code, reason, message));
}

export function asRejection(runtime: OperationRuntime, error: unknown): WebDriverError {
  const failure = toWebDriverError(error);
  attachFailureEffect(failure, 'none');
  return attachMutationReport(failure, { disposition: 'rejected', effect: 'none', quarantined: runtime.quarantined() });
}

/**
 * The service's quarantine error quotes the command and provider message that raised it. An agent reads errors as
 * instructions, so an operation reports quarantine in fixed words and keeps only the machine-readable report.
 */
function quarantinedError(runtime: OperationRuntime): WebDriverError {
  return rejection(
    runtime,
    'unknown error',
    'target-quarantined',
    'The target is quarantined because an earlier change may still land. Reads still work; an operator must recover the target before anything else changes it.',
  );
}

function sanitizeQuarantine(runtime: OperationRuntime, error: unknown): unknown {
  const failure = toWebDriverError(error);
  if (failure.data?.reason !== 'target-quarantined') {
    return error;
  }
  const report = readMutationReport(error);
  const sanitized = quarantinedError(runtime);
  return report ? attachMutationReport(sanitized, report) : sanitized;
}

/** Refuses a change while the target is quarantined, in fixed words. */
export function assertNotQuarantined(runtime: OperationRuntime): void {
  if (runtime.quarantined()) {
    throw quarantinedError(runtime);
  }
}

export function assertActionSupported(runtime: OperationRuntime, action: ActionName): void {
  const capability = requiredCapability[action];
  if (capability !== undefined && !runtime.capabilities[capability]) {
    throw rejection(runtime, 'unsupported operation', 'action-unsupported', `This provider does not support the ${action} action.`);
  }
}

/** Checks that the action cites a proof and the reference the proof names, and resolves the reference. */
export function resolveProven(runtime: OperationRuntime, ref: string, sample: string): { entry: ReferenceEntry; proof: UniquenessProof } {
  const proof = runtime.state.proofs.get(sample);
  if (!proof) {
    throw rejection(
      runtime,
      'invalid argument',
      'sample-not-unique',
      `Sample "${sample}" is not a find that proved a unique match, or it is too old. Run find again and cite its sample.`,
    );
  }
  if (proof.reference !== ref) {
    throw rejection(runtime, 'invalid argument', 'ref-not-proven', `Sample "${sample}" proved a different reference unique.`);
  }
  const resolution = runtime.state.refs.resolve(ref, runtime.previewGeneration());
  if (resolution.ok === false) {
    throw asRejection(runtime, referenceFailureError(resolution.failure, ref));
  }
  if (resolution.entry.nativeId !== proof.nativeId) {
    throw rejection(runtime, 'stale element reference', 'ref-stale', `Reference "${ref}" no longer names the proven element.`);
  }
  return { entry: resolution.entry, proof };
}

/**
 * Proves a selector names exactly one element with a complete search run now, exactly as `find` would, records the
 * proof, and resolves the match. Anything short of a unique match is refused before the input turn, asking the caller
 * to narrow the selector rather than acting on a guess.
 */
export async function proveSelector(
  runtime: OperationRuntime,
  selector: Selector,
): Promise<{ entry: ReferenceEntry; proof: UniquenessProof }> {
  let search;
  try {
    search = (await searchSelector(runtime, selector, { issueUnique: true })).value;
  } catch (error) {
    throw asRejection(runtime, error);
  }
  const { classification, proof } = search;
  if (proof) {
    runtime.state.proofs.record(proof);
    return resolveProven(runtime, proof.reference, proof.sample);
  }
  switch (classification.outcome) {
    case 'none':
      throw rejection(runtime, 'no such element', 'no-match', 'Nothing matches the selector. Observe the window to see what is there.');
    case 'multiple':
      throw rejection(
        runtime,
        'invalid argument',
        'selector-not-unique',
        `${search.complete ? classification.definite.length : 'At least ' + classification.definite.length} elements match the selector, so it names none of them. Narrow it, or run find and cite one match.`,
      );
    default:
      throw rejection(
        runtime,
        'invalid argument',
        'selector-inconclusive',
        `The search could not prove only one element matches (${classification.reasons.join(', ')}). Narrow it with within or another predicate, or run find.`,
      );
  }
}

/** Reads the element again, immediately before acting: the provider's liveness check and the fingerprint precondition. */
export async function revalidate(runtime: OperationRuntime, entry: ReferenceEntry, proof: UniquenessProof): Promise<NativeElementSnapshot> {
  if (entry.scope === 'preview' && runtime.stories) {
    const current = await runtime.stories.current(runtime.signal);
    if (current.changed || current.story?.verification === 'unconfirmed') {
      throw rejection(runtime, 'stale element reference', 'story-context-stale', 'The preview context is stale. Select the story again.');
    }
    const resolution = runtime.state.refs.resolve(entry.reference, runtime.previewGeneration());
    if (resolution.ok === false) {
      throw asRejection(runtime, referenceFailureError(resolution.failure, entry.reference));
    }
  }
  let snapshot: NativeElementSnapshot;
  try {
    snapshot = await runtime.command('Reading the element before acting', (signal) => runtime.host.snapshot(entry.nativeId, signal));
  } catch (error) {
    throw asRejection(runtime, interpretFailure(runtime, { windowId: entry.windowId, within: entry.reference }, error));
  }
  if (!matchesFingerprint(proof.fingerprint, snapshot)) {
    throw rejection(
      runtime,
      'stale element reference',
      'fingerprint-changed',
      `Reference "${entry.reference}" now shows a different role, name, or automation id than its sample. Run find again.`,
    );
  }
  return snapshot;
}

function isTrue(value: { supported: boolean; value?: unknown }): boolean {
  return value.supported && value.value === true;
}

function requireInteractable(runtime: OperationRuntime, action: ActionName, ref: string, snapshot: NativeElementSnapshot): void {
  if (action === 'clear') {
    return;
  }
  if (!isTrue(snapshot.enabled)) {
    throw rejection(runtime, 'element not interactable', 'not-enabled', `Reference "${ref}" is not enabled.`);
  }
  if (action === 'click' && !isTrue(snapshot.visible)) {
    throw rejection(runtime, 'element not interactable', 'not-visible', `Reference "${ref}" is not visible, so it cannot be clicked.`);
  }
}

/**
 * Whether the hit-tested element is the target or inside it. Every element id the walk learns is returned so the
 * caller can release the provider records it created.
 */
async function ownsHit(runtime: OperationRuntime, targetId: string, hit: NativeElementSnapshot, learned: string[]): Promise<boolean> {
  let current: NativeElementSnapshot | undefined = hit;
  for (let depth = 0; current && depth <= maxHitAncestors; depth += 1) {
    learned.push(current.id);
    if (current.id === targetId) {
      return true;
    }
    const parentId: string | undefined = current.parentId;
    current = parentId
      ? await runtime.command('Resolving the hit-test ancestor', (signal) => runtime.host.snapshot(parentId, signal)).catch(() => undefined)
      : undefined;
  }
  return false;
}

async function physicalClick(runtime: OperationRuntime, entry: ReferenceEntry, snapshot: NativeElementSnapshot): Promise<void> {
  const { host } = runtime;
  await runtime.mutate(`Activating the window of reference ${entry.reference}`, (signal) => host.activate(snapshot.windowId, signal));
  const x = snapshot.rect.x + snapshot.rect.width / 2;
  const y = snapshot.rect.y + snapshot.rect.height / 2;
  const learned: string[] = [];
  let owned = false;
  try {
    const hit = await runtime.command('Hit testing the element', (signal) => host.hitTest(snapshot.windowId, x, y, signal));
    owned = hit !== null && (await ownsHit(runtime, entry.nativeId, hit, learned));
  } finally {
    runtime.state.ledger.queue(learned);
  }
  if (!owned) {
    throw rejection(
      runtime,
      'element click intercepted',
      'obscured',
      `Something else is at the centre of reference "${entry.reference}", so a physical click would land elsewhere. Use activate, or bring the element into view.`,
    );
  }
  await runtime.mutate(`Clicking reference ${entry.reference}`, (signal) => host.click(entry.nativeId, 'physical', signal));
}

/**
 * Performs one named accessibility action. The element's actions are listed again inside the input turn, the name must
 * pick out exactly one, and the provider's key for it binds the exact native action, so an action renamed or
 * re-registered between the listing and the dispatch is refused rather than guessed at. Display names are not unique
 * identifiers, so a name the element publishes twice names neither action.
 */
async function performNamedAction(runtime: OperationRuntime, entry: ReferenceEntry, name: string): Promise<void> {
  const { host } = runtime;
  let actions;
  try {
    actions = await runtime.command(`Listing the actions of reference ${entry.reference}`, (signal) =>
      host.listAccessibilityActions(entry.nativeId, signal),
    );
  } catch (error) {
    throw asRejection(runtime, interpretFailure(runtime, { windowId: entry.windowId, within: entry.reference }, error));
  }
  const matches = actions.filter((action) => action.name === name);
  if (matches.length === 0) {
    throw rejection(
      runtime,
      'element not interactable',
      'action-not-published',
      `Reference "${entry.reference}" publishes no action by that name. Observe it with the actions fact to see what it publishes.`,
    );
  }
  if (matches.length > 1) {
    throw rejection(
      runtime,
      'element not interactable',
      'action-not-unique',
      `Reference "${entry.reference}" publishes ${matches.length} actions by that name, so the name names none of them.`,
    );
  }
  const [{ key }] = matches;
  await runtime.mutate(`Performing an accessibility action on reference ${entry.reference}`, (signal) =>
    host.performAccessibilityAction(entry.nativeId, key, signal),
  );
}

/** Dispatches one action on a revalidated element. Runs inside the physical input turn. */
export async function dispatchAction(
  runtime: OperationRuntime,
  options: { action: ActionName; name?: string; text?: string },
  entry: ReferenceEntry,
  snapshot: NativeElementSnapshot,
): Promise<void> {
  const { host } = runtime;
  switch (options.action) {
    case 'click':
      return physicalClick(runtime, entry, snapshot);
    case 'activate':
      return runtime.mutate(`Activating reference ${entry.reference}`, (signal) => host.click(entry.nativeId, 'accessibility', signal));
    case 'perform':
      return performNamedAction(runtime, entry, options.name!);
    case 'type':
      return runtime.mutate(`Typing into reference ${entry.reference}`, (signal) => host.sendKeys(entry.nativeId, options.text!, signal));
    case 'clear':
      return runtime.mutate(`Clearing reference ${entry.reference}`, (signal) => host.clear(entry.nativeId, signal));
  }
}

/**
 * Acts on one proven element: checks the proof, takes the target's input turn, revalidates the element, and dispatches.
 * Shared by `act` and by the action steps of `sequence`.
 */
export async function performAction(runtime: OperationRuntime, input: ActOptions): Promise<ActResult> {
  assertNotQuarantined(runtime);
  assertActionSupported(runtime, input.action);
  const { entry, proof } = input.find ? await proveSelector(runtime, input.find) : resolveProven(runtime, input.ref!, input.sample!);
  try {
    await runtime.input(async () => {
      if (runtime.signal.aborted) {
        throw rejection(runtime, 'unknown error', 'cancelled', 'The request was cancelled before anything was dispatched.');
      }
      if (runtime.quarantined()) {
        throw quarantinedError(runtime);
      }
      const snapshot = await revalidate(runtime, entry, proof);
      requireInteractable(runtime, input.action, input.ref, snapshot);
      await dispatchAction(runtime, input, entry, snapshot);
    });
  } catch (error) {
    // Every primary mutation settles through `runtime.mutate`, which reports what it did; a failure without a report
    // dispatched nothing.
    throw sanitizeQuarantine(runtime, readMutationReport(error) ? error : asRejection(runtime, error));
  }
  const warnings = await flushLedger(runtime);
  return {
    action: input.action,
    disposition: 'applied',
    mechanism: mechanismOf[input.action],
    ref: entry.reference,
    sample: proof.sample,
    ...(warnings.length > 0 ? { warnings } : {}),
    window: entry.windowId,
  };
}

export const actOperation = registerOperation({
  availability: requireBoundedObservation,
  effect: 'mutate',
  input: actInput,
  name: 'act',
  output: actOutput,
  summary:
    'Clicks, activates, performs a named accessibility action on, types into, or clears one element: a reference with the sample of a find that proved it unique, or a selector proven unique now. Name your own requestId: repeating it returns the first outcome instead of acting twice.',
  run: (input, runtime) => performAction(runtime, input),
  summarize(input, output) {
    const by = input.find ? selectorKeys(input.find) : undefined;
    return {
      action: input.action,
      ...(by === undefined ? { ref: input.ref!, sample: input.sample! } : { by }),
      ...(output ? { mechanism: output.mechanism, ...(by === undefined ? {} : { ref: output.ref, sample: output.sample }) } : {}),
    };
  },
});
