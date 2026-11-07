import { desktopInputMechanisms, desktopInputModeAllows } from '../authoring/input.js';
import type { DesktopInputMechanism, DesktopSessionInput } from '../authoring/input.js';
import type { DesktopClearMechanism, DesktopHostFeatures, NativeActionSequence } from '../host/types.js';
import { WebDriverError } from '../protocol/errors.js';
import { attachFailureEffect, readFailureEffect } from '../protocol/settlement.js';
import type { DesktopClickMode } from '../protocol/types.js';
import type { DesktopSession } from './SessionManager.js';

/** The host feature a strict session needs before it delivers each mechanism. */
const mechanismFeature: Readonly<Record<DesktopInputMechanism, keyof DesktopHostFeatures | undefined>> = {
  'accessibility-action': 'performAccessibilityAction',
  'accessibility-click': 'accessibilityClick',
  keyboard: 'keyboard',
  'physical-click': 'physicalClick',
  pointer: 'physicalClick',
  'semantic-clear': 'strictClear',
  'unattributed-clear': undefined,
  wheel: 'wheel',
};

/** What `GET /session/:id/furn/input` reports. */
export function describeSessionInput(session: DesktopSession): DesktopSessionInput {
  const receipts: Partial<Record<DesktopInputMechanism, number>> = {};
  for (const mechanism of desktopInputMechanisms) {
    const count = session.inputReceipts.get(mechanism);
    if (count) receipts[mechanism] = count;
  }
  return { mode: session.inputMode, receipts };
}

export function clickMechanism(mode: DesktopClickMode): DesktopInputMechanism {
  return mode === 'accessibility' ? 'accessibility-click' : 'physical-click';
}

/**
 * The mechanisms a sequence of actions delivers. A source that only pauses delivers nothing, so a strict session may
 * still wait with one; a pointer that moves without pressing still moves the real pointer.
 */
export function actionMechanisms(sequences: readonly NativeActionSequence[]): DesktopInputMechanism[] {
  const mechanisms = new Set<DesktopInputMechanism>();
  for (const sequence of sequences) {
    if (!sequence.actions.some((action) => action.type !== 'pause')) continue;
    if (sequence.type === 'key') mechanisms.add('keyboard');
    else if (sequence.type === 'pointer') mechanisms.add('pointer');
    else if (sequence.type === 'wheel') mechanisms.add('wheel');
  }
  return [...mechanisms];
}

/**
 * Refuses input a strict session's policy or host cannot deliver, before anything is dispatched, so the refusal is a
 * settled rejection. A compatibility session leaves the decision to the host, as it always has.
 */
export function assertInputAllowed(session: DesktopSession, mechanism: DesktopInputMechanism, description: string): void {
  const mode = session.inputMode;
  if (mode === 'compatibility') return;
  if (!desktopInputModeAllows(mode, mechanism)) {
    throw refuse(`${description} would deliver ${mechanism} input, which a session with input mode "${mode}" never delivers.`, {
      inputMode: mode,
      mechanism,
      reason: 'input-policy',
    });
  }
  const feature = mechanismFeature[mechanism];
  if (feature && session.hostInfo.features[feature] !== true) {
    throw refuse(`${description} would deliver ${mechanism} input, which target "${session.target.id}" does not deliver.`, {
      inputMode: mode,
      mechanism,
      reason: 'input-unsupported',
    });
  }
}

/** The clear mechanism a strict session requires, after checking the host can clear with only that mechanism. */
export function strictClearMechanism(session: DesktopSession, description: string): DesktopClearMechanism | undefined {
  const mode = session.inputMode;
  if (mode === 'compatibility') return undefined;
  const mechanism: DesktopClearMechanism = mode === 'accessible' ? 'semantic' : 'keyboard';
  assertInputAllowed(session, mechanism === 'semantic' ? 'semantic-clear' : 'keyboard', description);
  if (session.hostInfo.features.strictClear !== true) {
    throw refuse(`${description} needs a ${mechanism} clear, but target "${session.target.id}" cannot clear with only one mechanism.`, {
      inputMode: mode,
      mechanism: mechanism === 'semantic' ? 'semantic-clear' : 'keyboard',
      reason: 'input-unsupported',
    });
  }
  return mechanism;
}

/**
 * Dispatches one delivery of input and records its receipt. A failure counts unless it proves nothing was dispatched,
 * because a delivery whose outcome was not observed may still have reached the application.
 */
export async function deliverInput<T>(
  session: DesktopSession,
  mechanisms: readonly DesktopInputMechanism[],
  dispatch: () => Promise<T>,
): Promise<T> {
  try {
    const result = await dispatch();
    recordInput(session, mechanisms);
    return result;
  } catch (error) {
    if (readFailureEffect(error) !== 'none') recordInput(session, mechanisms);
    throw error;
  }
}

/**
 * Clears and records how. A strict session asks for one mechanism and fails a host that used another or would not say,
 * after recording what was delivered. A compatibility session records what the host reports, or an unattributed clear.
 */
export async function deliverClear(
  session: DesktopSession,
  requested: DesktopClearMechanism | undefined,
  description: string,
  dispatch: (mechanism: DesktopClearMechanism | undefined) => Promise<DesktopClearMechanism | void>,
): Promise<DesktopClearMechanism | undefined> {
  let used: DesktopClearMechanism | void;
  try {
    used = await dispatch(requested);
  } catch (error) {
    if (readFailureEffect(error) !== 'none') recordInput(session, [clearReceipt(requested)]);
    throw error;
  }
  recordInput(session, [clearReceipt(used || undefined)]);
  if (requested && used !== requested) {
    throw attachFailureEffect(
      new WebDriverError(
        'unknown error',
        `${description} asked for a ${requested} clear, and the host cleared ${used ? `with the ${used} mechanism` : 'without saying how'}.`,
        {
          reason: 'input-mechanism-mismatch',
        },
      ),
      'applied',
    );
  }
  return used || undefined;
}

function clearReceipt(mechanism: DesktopClearMechanism | undefined): DesktopInputMechanism {
  return mechanism === 'semantic' ? 'semantic-clear' : mechanism === 'keyboard' ? 'keyboard' : 'unattributed-clear';
}

function recordInput(session: DesktopSession, mechanisms: readonly DesktopInputMechanism[]): void {
  for (const mechanism of mechanisms) {
    session.inputReceipts.set(mechanism, (session.inputReceipts.get(mechanism) ?? 0) + 1);
  }
}

function refuse(message: string, data: Record<string, unknown>): Error {
  const error = new WebDriverError('unsupported operation', message, data);
  return attachFailureEffect(error, 'none');
}
