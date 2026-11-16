import { spawn } from 'node:child_process';
import path from 'node:path';

import type {
  ApplicationLease,
  DesktopClearMechanism,
  DesktopHost,
  DesktopHostEvent,
  DesktopHostFeatures,
  DesktopHostInfo,
  DesktopTarget,
  DesktopWindow,
  DesktopWindowEventLog,
  NativeAccessibilityAction,
  NativeActionSequence,
  NativeElementSnapshot,
  NativeImage,
  NativeObservation,
  NativeObserveRequest,
  NativeSearchRoot,
  NativeSelector,
  Rect,
} from '../../host/types.js';
import type {
  NativeApplicationIdentity,
  NativeDesktopApplicationDescriptor,
  NativeDriverArtifact,
  NativeDriverProvider,
  NativeHostEventMessage,
} from '../../native/types.js';
import { NativeDriverError } from '../../native/NativeDriverError.js';
import { isSingleWebDriverKeyValue } from '../../protocol/actions.js';
import { HostStaleError, HostUnsupportedError, HostWebDriverError } from '../../protocol/errors.js';
import { describeObserveRequestViolation, describeReleaseViolation, parseNativeObservation } from '../../protocol/observation.js';
import type { WebDriverErrorCode } from '../../protocol/errors.js';
import { attachFailureEffect, attachProviderQuarantine, readFailureEffect } from '../../protocol/settlement.js';
import type { MutationEffect } from '../../protocol/settlement.js';
import type { DesktopEndpoint } from '../../protocol/types.js';
import { nativeHelperSpawnOptions, NativeHostProcess, resolveCancellationTimeoutMs } from './NativeHostProcess.js';

export type NativeDesktopHostOptions = {
  application: NativeDesktopApplicationDescriptor;
  artifact: NativeDriverArtifact;
  /**
   * How long the helper may take to settle a cancelled command before it is killed, in whole milliseconds from 100 to
   * 60000. Defaults to 2000 on macOS and 10000 on Windows, where a helper step can legitimately run for seconds
   * before it can acknowledge cancellation. Killing the Windows helper also ends the application under test.
   */
  cancellationTimeoutMs?: number;
  disabledInputFeatures?: readonly NativeDisabledInputFeature[];
  endpoint: DesktopEndpoint;
  onStderr?: (message: string) => void;
  onFailure?: (error: Error) => void;
};

export type NativeDisabledInputFeature = 'keyboard' | 'physicalClick' | 'wheel';

export const FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES = 'FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES';

const defaultCancellationTimeoutMs: Readonly<Record<NativeDriverProvider, number>> = { macos: 2000, windows: 10_000 };

/** The most stderr text or output kept from the input recovery process. */
const maximumRecoveryOutputBytes = 16 * 1024;

function requireApplicationIdentity(value: unknown, endpoint: DesktopEndpoint): NativeApplicationIdentity {
  const result = value as Partial<NativeApplicationIdentity> | null;
  const windows = endpoint !== 'macos';
  if (
    !result ||
    typeof result !== 'object' ||
    Array.isArray(result) ||
    Object.keys(result).some(
      (key) =>
        !(
          windows ? ['processId', 'processStartedAt', 'executablePath', 'interactiveSession', 'aumid'] : ['processId', 'processStartedAt']
        ).includes(key),
    ) ||
    typeof result.processId !== 'number' ||
    !Number.isInteger(result.processId) ||
    result.processId < 1 ||
    result.processId > 0x7fffffff ||
    typeof result.processStartedAt !== 'string' ||
    !(
      windows
        ? /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{7}Z$/
        : /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z$/
    ).test(result.processStartedAt) ||
    !Number.isFinite(Date.parse(result.processStartedAt)) ||
    (windows &&
      (typeof result.executablePath !== 'string' ||
        !path.win32.isAbsolute(result.executablePath) ||
        result.executablePath.length > 4096 ||
        /\p{Cc}/u.test(result.executablePath) ||
        typeof result.interactiveSession !== 'string' ||
        !/^windows-session:[0-9]{1,10}$/.test(result.interactiveSession) ||
        (result.aumid !== undefined &&
          (typeof result.aumid !== 'string' || result.aumid.length < 1 || result.aumid.length > 4096 || /\p{Cc}/u.test(result.aumid)))))
  ) {
    throw new HostWebDriverError('unknown error', 'The native application identity is invalid.', {
      nativeCode: 'invalid-application-identity',
    });
  }
  return Object.freeze({ ...result } as NativeApplicationIdentity);
}

export class NativeDesktopHost implements DesktopHost {
  readonly endpoint: DesktopEndpoint;

  private readonly application: NativeDesktopApplicationDescriptor;
  private readonly artifact: NativeDriverArtifact;
  private readonly cancellationTimeoutMs: number;
  private readonly disabledInputFeatures: ReadonlySet<NativeDisabledInputFeature>;
  private readonly onStderr?: (message: string) => void;
  private readonly onFailure?: (error: Error) => void;
  /** Aborted by `dispose`, so a helper still starting up is killed instead of outliving the host. */
  private readonly lifetime = new AbortController();
  private disposing = false;
  private readonly listeners = new Set<(event: DesktopHostEvent) => void>();
  private readonly depressedButtons = new Set<number>();
  private readonly depressedKeys = new Set<string>();
  private readonly uncertainButtons = new Set<number>();
  private readonly uncertainKeys = new Set<string>();
  private potentialButtons = new Set<number>();
  private potentialKeys = new Set<string>();
  private failure?: Error;
  private processPromise?: Promise<NativeHostProcess>;
  /** What the helper last reported it supports. Every session is created after a probe. */
  private probedFeatures?: DesktopHostFeatures;

  constructor({
    application,
    artifact,
    cancellationTimeoutMs,
    disabledInputFeatures,
    endpoint,
    onStderr,
    onFailure,
  }: NativeDesktopHostOptions) {
    if (!artifact.endpoints.includes(endpoint)) {
      throw new TypeError(`Native helper ${artifact.provider} does not support endpoint "${endpoint}".`);
    }
    this.application = Object.freeze({ ...application });
    this.artifact = artifact;
    this.cancellationTimeoutMs = resolveCancellationTimeoutMs(cancellationTimeoutMs, defaultCancellationTimeoutMs[artifact.provider]);
    this.disabledInputFeatures = resolveDisabledInputFeatures(disabledInputFeatures);
    this.endpoint = endpoint;
    this.onStderr = onStderr;
    this.onFailure = onFailure;
  }

  async probe(signal?: AbortSignal): Promise<DesktopHostInfo> {
    const hostInfo = await this.request<DesktopHostInfo>('probe', { endpoint: this.endpoint }, signal);
    const masked = applyDisabledInputFeaturePolicy(hostInfo, this.disabledInputFeatures);
    this.probedFeatures = masked.features;
    return masked;
  }

  async launch(target: DesktopTarget, signal?: AbortSignal): Promise<ApplicationLease> {
    return this.request('launch', this.targetParams(target), signal);
  }

  async attach(target: DesktopTarget, signal?: AbortSignal): Promise<ApplicationLease> {
    return this.request('attach', this.targetParams(target), signal);
  }

  /** Descriptor verification without acquiring a lease, application lock, or window/element records. */
  async inspectApplication(target: DesktopTarget, signal?: AbortSignal): Promise<NativeApplicationIdentity> {
    return requireApplicationIdentity(await this.request('inspectApplication', this.targetParams(target), signal), this.endpoint);
  }

  /** Trusted workload recovery only; no WebDriver route exposes termination of a recorded Windows survivor. */
  async recoverApplication(identity: NativeApplicationIdentity, signal?: AbortSignal): Promise<void> {
    if (this.endpoint === 'macos') throw new HostUnsupportedError('Exact survivor recovery is Windows-only.');
    const verified = requireApplicationIdentity(identity, this.endpoint);
    const result = await this.request<{ state?: unknown } | null>(
      'recoverApplication',
      { identity: verified, endpoint: this.endpoint },
      signal,
    );
    if (!result || typeof result !== 'object' || Object.keys(result).length !== 1 || result.state !== 'exited') {
      throw new HostWebDriverError('unknown error', 'The native helper did not prove exact application exit.', {
        nativeCode: 'application-recovery-unsettled',
      });
    }
  }

  async closeApplication(lease: ApplicationLease, signal?: AbortSignal): Promise<void> {
    await this.request('closeApplication', { lease }, signal);
  }

  windows(lease: ApplicationLease, signal?: AbortSignal): Promise<DesktopWindow[]> {
    return this.request('windows', { lease }, signal);
  }

  async closeWindow(windowId: string, signal?: AbortSignal): Promise<void> {
    await this.request('closeWindow', { windowId }, signal);
  }

  async activate(windowId: string, signal?: AbortSignal): Promise<void> {
    await this.request('activate', { windowId }, signal);
  }

  getWindowRect(windowId: string, signal?: AbortSignal): Promise<Rect> {
    return this.request('getWindowRect', { windowId }, signal);
  }

  setWindowRect(windowId: string, rect: Partial<Rect>, signal?: AbortSignal): Promise<Rect> {
    return this.request('setWindowRect', { rect, windowId }, signal);
  }

  find(root: NativeSearchRoot, selector: NativeSelector, signal?: AbortSignal): Promise<NativeElementSnapshot[]> {
    return this.request('find', { root, selector }, signal);
  }

  snapshot(elementId: string, signal?: AbortSignal): Promise<NativeElementSnapshot> {
    return this.request('snapshot', { elementId }, signal);
  }

  activeElement(windowId: string, signal?: AbortSignal): Promise<NativeElementSnapshot | null> {
    return this.request('activeElement', { windowId }, signal);
  }

  hitTest(windowId: string, x: number, y: number, signal?: AbortSignal): Promise<NativeElementSnapshot | null> {
    return this.request('hitTest', { windowId, x, y }, signal);
  }

  async click(elementId: string, mode: 'accessibility' | 'auto' | 'physical', signal?: AbortSignal): Promise<void> {
    if (this.disabledInputFeatures.has('physicalClick')) {
      if (mode === 'auto') {
        await this.request('click', { elementId, mode: 'accessibility' }, signal);
        return;
      }
      if (mode === 'physical') {
        throw rejectedBeforeDispatch(new HostUnsupportedError('Physical pointer input is disabled by the registered target policy.'));
      }
    }
    const includePointer = mode !== 'accessibility';
    if (includePointer) {
      this.potentialButtons.add(0);
    }
    try {
      await this.request('click', { elementId, mode }, signal);
    } catch (error) {
      if (includePointer) this.rememberUncertainInput(error);
      throw error;
    } finally {
      this.refreshPotentialInput();
    }
  }

  /**
   * A target that masks the keyboard may still clear semantically, so an unspecified clear is narrowed to the semantic
   * mechanism there rather than refused, when the probed helper clears strictly. Without a mechanism a helper that
   * predates strict clear reports none, and the clear stays unattributed.
   */
  async clear(elementId: string, signal?: AbortSignal, mechanism?: DesktopClearMechanism): Promise<DesktopClearMechanism | void> {
    if (mechanism === 'keyboard' && this.disabledInputFeatures.has('keyboard')) {
      throw rejectedBeforeDispatch(new HostUnsupportedError('Physical keyboard input is disabled by the registered target policy.'));
    }
    const requested = mechanism ?? (this.disabledInputFeatures.has('keyboard') ? 'semantic' : undefined);
    if (requested && this.probedFeatures?.strictClear !== true) {
      throw rejectedBeforeDispatch(
        new HostUnsupportedError(
          mechanism
            ? `The native helper cannot clear with only the ${mechanism} mechanism.`
            : 'Physical keyboard fallback is disabled by the registered target policy, and the native helper cannot clear only semantically.',
        ),
      );
    }
    const result = await this.request<unknown>('clear', { elementId, ...(requested ? { mechanism: requested } : {}) }, signal);
    return parseClearMechanism(result);
  }

  async sendKeys(elementId: string, text: string, signal?: AbortSignal): Promise<void> {
    if (this.disabledInputFeatures.has('keyboard')) {
      throw rejectedBeforeDispatch(new HostUnsupportedError('Physical keyboard input is disabled by the registered target policy.'));
    }
    this.potentialKeys = new Set([...this.potentialKeys, ...typedTextRecoveryKeys(text)]);
    try {
      await this.request('sendKeys', { elementId, text }, signal);
    } catch (error) {
      this.rememberUncertainInput(error);
      throw error;
    } finally {
      this.refreshPotentialInput();
    }
  }

  async performActions(actions: readonly NativeActionSequence[], signal?: AbortSignal): Promise<void> {
    for (const sequence of actions) {
      // A source that only pauses delivers nothing, so a masked target may still wait with one.
      if (sequence.actions.every((action) => action.type === 'pause')) continue;
      if (
        (sequence.type === 'key' && this.disabledInputFeatures.has('keyboard')) ||
        (sequence.type === 'pointer' && this.disabledInputFeatures.has('physicalClick')) ||
        (sequence.type === 'wheel' && this.disabledInputFeatures.has('wheel'))
      ) {
        throw rejectedBeforeDispatch(new HostUnsupportedError(`${sequence.type} input is disabled by the registered target policy.`));
      }
    }
    let plan: InputLedgerPlan;
    try {
      plan = planInputLedger(actions, this.depressedKeys, this.depressedButtons);
    } catch (error) {
      throw rejectedBeforeDispatch(error);
    }
    this.potentialKeys = new Set([...this.potentialKeys, ...plan.potentialKeys]);
    this.potentialButtons = new Set([...this.potentialButtons, ...plan.potentialButtons]);
    try {
      await this.request('performActions', { actions }, signal);
      replaceSet(this.depressedKeys, plan.finalKeys);
      replaceSet(this.depressedButtons, plan.finalButtons);
    } catch (error) {
      this.rememberUncertainInput(error);
      throw error;
    } finally {
      this.refreshPotentialInput();
    }
  }

  async releaseActions(signal?: AbortSignal): Promise<void> {
    try {
      await this.request('releaseActions', undefined, signal);
      this.clearInputLedger();
    } catch (error) {
      this.rememberUncertainInput(error);
      throw error;
    } finally {
      this.refreshPotentialInput();
    }
  }

  captureWindow(windowId: string, signal?: AbortSignal): Promise<NativeImage> {
    return this.requestImage('captureWindow', { windowId }, signal);
  }

  captureElement(elementId: string, signal?: AbortSignal): Promise<NativeImage> {
    return this.requestImage('captureElement', { elementId }, signal);
  }

  source(windowId: string, signal?: AbortSignal): Promise<string> {
    return this.request('source', { windowId }, signal);
  }

  tree(windowId: string, signal?: AbortSignal): Promise<NativeElementSnapshot[]> {
    return this.request('tree', { windowId }, signal);
  }

  windowEvents(lease: ApplicationLease, signal?: AbortSignal): Promise<DesktopWindowEventLog> {
    return this.request('windowEvents', { lease }, signal);
  }

  async accessibilityActions(elementId: string, signal?: AbortSignal): Promise<string[]> {
    const result = await this.request<{ actions: string[] }>('accessibilityActions', { elementId }, signal);
    return result.actions;
  }

  async listAccessibilityActions(elementId: string, signal?: AbortSignal): Promise<NativeAccessibilityAction[]> {
    const result = await this.request<{ actions?: unknown; keys?: unknown }>('accessibilityActions', { elementId }, signal);
    return parseKeyedActions(result);
  }

  async performAccessibilityAction(elementId: string, key: string, signal?: AbortSignal): Promise<void> {
    await this.request('performAccessibilityAction', { elementId, key }, signal);
  }

  async observe(request: NativeObserveRequest, signal?: AbortSignal): Promise<NativeObservation> {
    const violation = describeObserveRequestViolation(request);
    if (violation) {
      throw new HostWebDriverError('invalid argument', `The observation request is invalid: ${violation}`);
    }
    const parsed = parseNativeObservation(request, await this.request<unknown>('observe', request, signal));
    if (parsed.status === 'rejected') {
      throw new HostWebDriverError('unknown error', `The native helper returned an invalid observation: ${parsed.message}`, {
        nativeCode: 'invalid-observation',
      });
    }
    return parsed.observation;
  }

  async releaseElements(elementIds: readonly string[], signal?: AbortSignal): Promise<number> {
    const violation = describeReleaseViolation(elementIds);
    if (violation) {
      throw new HostWebDriverError('invalid argument', `The release request is invalid: ${violation}`);
    }
    const result = await this.request<{ released?: unknown }>('releaseElements', { ids: elementIds }, signal);
    const released = result?.released;
    if (typeof released !== 'number' || !Number.isInteger(released) || released < 0 || released > elementIds.length) {
      throw new HostWebDriverError('unknown error', 'The native helper returned an invalid release count.', {
        nativeCode: 'invalid-release',
      });
    }
    return released;
  }

  subscribe(listener: (event: DesktopHostEvent) => void): () => void {
    if (this.disposing) {
      return () => undefined;
    }
    this.listeners.add(listener);
    void this.getProcess().catch(() => undefined);
    return () => this.listeners.delete(listener);
  }

  /** Stops the helper. A helper that failed to start is already gone, so that failure is not reported here. */
  async dispose(signal?: AbortSignal): Promise<void> {
    this.disposing = true;
    this.lifetime.abort();
    const startup = this.processPromise?.then(
      (started) => started,
      () => undefined,
    );
    const process = startup && (await waitForStartup(startup, signal));
    await process?.dispose(signal);
  }

  private rememberUncertainInput(error: unknown): void {
    if (readFailureEffect(error) === 'none') return;
    for (const key of this.potentialKeys) this.uncertainKeys.add(key);
    for (const button of this.potentialButtons) this.uncertainButtons.add(button);
  }

  private refreshPotentialInput(): void {
    this.potentialKeys = new Set([...this.depressedKeys, ...this.uncertainKeys]);
    this.potentialButtons = new Set([...this.depressedButtons, ...this.uncertainButtons]);
  }

  private clearInputLedger(): void {
    this.depressedKeys.clear();
    this.depressedButtons.clear();
    this.uncertainKeys.clear();
    this.uncertainButtons.clear();
    this.potentialKeys.clear();
    this.potentialButtons.clear();
  }

  private targetParams(target: DesktopTarget): Record<string, unknown> {
    return {
      application: this.application,
      endpoint: target.endpoint,
      launchTimeoutMs: target.launchTimeoutMs,
      renderer: target.renderer,
      storyRootTestId: target.storyRootTestId,
      targetId: target.id,
    };
  }

  private async request<T>(command: string, params?: unknown, signal?: AbortSignal): Promise<T> {
    try {
      const process = await this.getProcess(signal);
      const response = await process.request<T>(command, params, signal);
      return response.result;
    } catch (error) {
      throw translateNativeError(error);
    }
  }

  private async requestImage(command: string, params?: unknown, signal?: AbortSignal): Promise<NativeImage> {
    try {
      const process = await this.getProcess(signal);
      const response = await process.request<Omit<NativeImage, 'data'>>(command, params, signal);
      if (!response.binary) {
        throw new Error(`Native helper did not return binary data for "${command}".`);
      }
      return { ...response.result, data: response.binary };
    } catch (error) {
      throw translateNativeError(error);
    }
  }

  private getProcess(signal?: AbortSignal): Promise<NativeHostProcess> {
    if (this.failure) {
      return Promise.reject(this.failure);
    }
    if (this.disposing) {
      return Promise.reject(attachFailureEffect(new NativeDriverError('host-closed', 'Native driver helper is closed.'), 'none'));
    }
    if (!this.processPromise) {
      this.processPromise = NativeHostProcess.start({
        artifact: this.artifact,
        cancellationTimeoutMs: this.cancellationTimeoutMs,
        onStderr: this.onStderr,
        recoverInput: () => this.recoverInput(),
        signal: this.lifetime.signal,
      }).then((process) => {
        process.on('event', (message) => this.onEvent(message));
        process.on('exit', (error) => {
          this.failure = error;
          this.processPromise = undefined;
          if (!this.disposing) this.onFailure?.(error);
        });
        return process;
      });
      this.processPromise.catch(() => undefined);
    }
    return waitForStartup(this.processPromise, signal);
  }

  private recoverInput(): Promise<void> {
    const keys = [...this.potentialKeys];
    const buttons = [...this.potentialButtons];
    if (keys.length === 0 && buttons.length === 0) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const child = spawn(this.artifact.executablePath, ['--release-input'], nativeHelperSpawnOptions());
      const stdout = new BoundedOutput(maximumRecoveryOutputBytes);
      const stderr = new BoundedOutput(maximumRecoveryOutputBytes);
      let settled = false;
      let stdinError: Error | undefined;
      let timeoutError: NativeDriverError | undefined;
      const timeout = setTimeout(() => {
        timeoutError = new NativeDriverError('input-recovery-timeout', 'Native input recovery did not complete within 5 seconds.');
        child.kill();
      }, 5000);
      child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
      child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
      child.once('error', (error) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          reject(error);
        }
      });
      child.stdin.once('error', (error) => {
        stdinError = error;
      });
      child.once('exit', () => {
        // A grandchild that inherited the pipes would hold `close` back indefinitely.
        setTimeout(() => {
          child.stdout.destroy();
          child.stderr.destroy();
          child.stdin.destroy();
        }, 500).unref();
      });
      child.once('close', (code) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeout);
        if (timeoutError) {
          reject(timeoutError);
          return;
        }
        if (code !== 0) {
          reject(
            new NativeDriverError(
              'input-recovery-failed',
              stderr.text() || stdinError?.message || `Native input recovery exited with code ${String(code)}.`,
            ),
          );
          return;
        }
        try {
          JSON.parse(stdout.text());
          this.clearInputLedger();
          resolve();
        } catch (error) {
          reject(new NativeDriverError('input-recovery-failed', error instanceof Error ? error.message : String(error)));
        }
      });
      child.stdin.end(JSON.stringify({ buttons, keys }));
    });
  }

  private onEvent(message: NativeHostEventMessage): void {
    const payload = message.payload as Record<string, unknown> | undefined;
    let event: DesktopHostEvent | undefined;
    if (message.event === 'application-exited' && typeof payload?.applicationId === 'string') {
      event = { applicationId: payload.applicationId, type: 'application-exited' };
    } else if (message.event === 'structure-changed' && typeof payload?.windowId === 'string') {
      event = { type: 'structure-changed', windowId: payload.windowId };
    } else if (message.event === 'window-closed' && typeof payload?.windowId === 'string') {
      event = { type: 'window-closed', windowId: payload.windowId };
    } else if (message.event === 'window-opened' && typeof payload?.windowId === 'string') {
      event = { type: 'window-opened', windowId: payload.windowId };
    }

    if (event) {
      for (const listener of this.listeners) {
        listener(event);
      }
    }
  }
}

type InputLedgerPlan = {
  finalButtons: Set<number>;
  finalKeys: Set<string>;
  potentialButtons: Set<number>;
  potentialKeys: Set<string>;
};

function planInputLedger(
  actions: readonly NativeActionSequence[],
  currentKeys: ReadonlySet<string>,
  currentButtons: ReadonlySet<number>,
): InputLedgerPlan {
  const finalKeys = new Set(currentKeys);
  const finalButtons = new Set(currentButtons);
  const potentialKeys = new Set(currentKeys);
  const potentialButtons = new Set(currentButtons);
  for (const sequence of actions) {
    for (const action of sequence.actions) {
      if (action.type === 'keyDown' || action.type === 'keyUp') {
        const value = action.value;
        if (typeof value !== 'string' || !isSingleWebDriverKeyValue(value)) {
          throw new TypeError(`${action.type} values must contain exactly one Unicode code point.`);
        }
        if (action.type === 'keyDown') {
          finalKeys.add(value);
          potentialKeys.add(value);
        } else {
          finalKeys.delete(value);
        }
      } else if (action.type === 'pointerDown' && typeof action.button === 'number') {
        finalButtons.add(action.button);
        potentialButtons.add(action.button);
      } else if (action.type === 'pointerUp' && typeof action.button === 'number') {
        finalButtons.delete(action.button);
      }
    }
  }
  return { finalButtons, finalKeys, potentialButtons, potentialKeys };
}

function replaceSet<T>(target: Set<T>, source: ReadonlySet<T>): void {
  target.clear();
  for (const value of source) {
    target.add(value);
  }
}

function typedTextRecoveryKeys(text: string): Set<string> {
  const keys = new Set<string>();
  for (const value of text) {
    if (value === '\r') {
      continue;
    }
    keys.add(value === '\n' ? '\uE006' : value);
  }
  return keys;
}

export function applyDisabledInputFeaturePolicy(
  hostInfo: DesktopHostInfo,
  disabledFeatures: ReadonlySet<NativeDisabledInputFeature>,
): DesktopHostInfo {
  if (disabledFeatures.size === 0) {
    return hostInfo;
  }
  const features: DesktopHostFeatures = { ...hostInfo.features };
  for (const feature of disabledFeatures) {
    features[feature] = false;
  }
  return { ...hostInfo, features };
}

export function resolveDisabledInputFeatures(configured?: readonly NativeDisabledInputFeature[]): ReadonlySet<NativeDisabledInputFeature> {
  const values = [
    ...(configured ?? []),
    ...(process.env[FURN_DESKTOP_DRIVER_DISABLED_INPUT_FEATURES]
      ?.split(',')
      .map((value) => value.trim())
      .filter(Boolean) ?? []),
  ];
  const allowed = new Set<NativeDisabledInputFeature>(['keyboard', 'physicalClick', 'wheel']);
  const resolved = new Set<NativeDisabledInputFeature>();
  for (const value of values) {
    if (!allowed.has(value as NativeDisabledInputFeature)) {
      throw new TypeError(`Unsupported disabled native input feature "${value}".`);
    }
    resolved.add(value as NativeDisabledInputFeature);
  }
  return resolved;
}

/** Collects at most a fixed number of bytes and drops the rest, so a noisy child cannot grow Node's memory. */
class BoundedOutput {
  private readonly chunks: Buffer[] = [];
  private readonly limit: number;
  private bytes = 0;

  constructor(limit: number) {
    this.limit = limit;
  }

  push(chunk: Buffer): void {
    const room = this.limit - this.bytes;
    if (room <= 0) {
      return;
    }
    const kept = chunk.length > room ? chunk.subarray(0, room) : chunk;
    this.chunks.push(kept);
    this.bytes += kept.length;
  }

  text(): string {
    return Buffer.concat(this.chunks).toString('utf8');
  }
}

/** Waits for a shared startup on behalf of one caller: that caller's abort stops its wait, not the startup. */
function waitForStartup<T>(startup: Promise<T>, signal: AbortSignal | undefined): Promise<T> {
  if (!signal) {
    return startup;
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      const error = new Error('The native driver command was cancelled while the helper was starting.');
      error.name = 'AbortError';
      reject(attachFailureEffect(error, 'none'));
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener('abort', onAbort, { once: true });
    startup.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

/** The longest action key a provider may issue. Keys are opaque, so this only bounds what Node holds. */
const maxActionKeyLength = 128;

/** Pairs each listed action with its key, refusing a response whose lists disagree or whose keys are malformed. */
export function parseKeyedActions(result: { actions?: unknown; keys?: unknown } | undefined): NativeAccessibilityAction[] {
  const actions = result?.actions;
  const keys = result?.keys;
  if (
    !Array.isArray(actions) ||
    !Array.isArray(keys) ||
    actions.length !== keys.length ||
    !actions.every((name) => typeof name === 'string') ||
    !keys.every((key) => typeof key === 'string' && key.length > 0 && key.length <= maxActionKeyLength)
  ) {
    throw new HostWebDriverError('unknown error', 'The native helper returned invalid accessibility action keys.', {
      nativeCode: 'invalid-action-keys',
    });
  }
  return actions.map((name: string, index) => ({ key: keys[index] as string, name }));
}

const nativeWebDriverErrorCodes: Readonly<Record<string, WebDriverErrorCode>> = {
  'capture-failed': 'unable to capture screen',
  'element-not-interactable': 'element not interactable',
  'invalid-params': 'invalid argument',
  'invalid-request': 'invalid argument',
  'no-such-element': 'no such element',
  'no-such-window': 'no such window',
};

/** The mechanism a helper reports it cleared with. A helper that predates strict clear reports none. */
function parseClearMechanism(result: unknown): DesktopClearMechanism | undefined {
  const mechanism = typeof result === 'object' && result !== null ? (result as { mechanism?: unknown }).mechanism : undefined;
  return mechanism === 'keyboard' || mechanism === 'semantic' ? mechanism : undefined;
}

/** Marks a failure raised before any command reached the provider, so no effect can have been dispatched. */
function rejectedBeforeDispatch<T>(error: T): T {
  return error instanceof Error ? attachFailureEffect(error, 'none') : error;
}

/**
 * Codes a provider raises when it bounds its own application calls and quarantines itself. Each carries its effect, so
 * a provider that reports no `effect` is still read correctly: an unsettled mutation may have landed, while a refused
 * one never reached the application.
 */
const nativeSettlementEffects: Readonly<Record<string, MutationEffect>> = {
  'mutation-indeterminate': 'unknown',
  'target-quarantined': 'none',
};

export function translateNativeError(error: unknown): unknown {
  if (!(error instanceof NativeDriverError)) {
    return error;
  }
  const settlementEffect = nativeSettlementEffects[error.code];
  if (settlementEffect) {
    const settled = new HostWebDriverError('unknown error', error.message, { ...error.data, nativeCode: error.code });
    return attachProviderQuarantine(attachFailureEffect(settled, settlementEffect));
  }
  const effect = readFailureEffect(error);
  if (error.code === 'unsupported-operation') {
    return attachFailureEffect(new HostUnsupportedError(error.message, { ...error.data, nativeCode: error.code }), effect);
  }
  if (error.code === 'stale-element') {
    return attachFailureEffect(new HostStaleError(error.message), effect);
  }
  const webdriverCode = nativeWebDriverErrorCodes[error.code];
  if (webdriverCode) {
    return attachFailureEffect(new HostWebDriverError(webdriverCode, error.message, error.data), effect);
  }
  if (error.code === 'automation-failed') {
    // It stays the generic code, but a provider's `reason` and the native code must reach the caller that branches on them.
    return attachFailureEffect(new HostWebDriverError('unknown error', error.message, { ...error.data, nativeCode: error.code }), effect);
  }
  return error;
}
