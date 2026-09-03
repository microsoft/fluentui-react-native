import { spawn } from 'node:child_process';

import type {
  ApplicationLease,
  DesktopHost,
  DesktopHostEvent,
  DesktopHostInfo,
  DesktopTarget,
  DesktopWindow,
  NativeActionSequence,
  NativeElementSnapshot,
  NativeImage,
  NativeSearchRoot,
  NativeSelector,
  Rect,
} from '../../host/types.js';
import type { NativeDesktopApplicationDescriptor, NativeDriverArtifact, NativeHostEventMessage } from '../../native/types.js';
import { NativeDriverError } from '../../native/NativeDriverError.js';
import { isSingleWebDriverKeyValue } from '../../protocol/actions.js';
import { HostStaleError, HostUnsupportedError, HostWebDriverError } from '../../protocol/errors.js';
import type { WebDriverErrorCode } from '../../protocol/errors.js';
import type { DesktopEndpoint } from '../../protocol/types.js';
import { NativeHostProcess } from './NativeHostProcess.js';

export type NativeDesktopHostOptions = {
  application: NativeDesktopApplicationDescriptor;
  artifact: NativeDriverArtifact;
  endpoint: DesktopEndpoint;
  onStderr?: (message: string) => void;
};

export class NativeDesktopHost implements DesktopHost {
  readonly endpoint: DesktopEndpoint;

  private readonly application: NativeDesktopApplicationDescriptor;
  private readonly artifact: NativeDriverArtifact;
  private readonly onStderr?: (message: string) => void;
  private readonly listeners = new Set<(event: DesktopHostEvent) => void>();
  private readonly depressedButtons = new Set<number>();
  private readonly depressedKeys = new Set<string>();
  private potentialButtons = new Set<number>();
  private potentialKeys = new Set<string>();
  private failure?: Error;
  private processPromise?: Promise<NativeHostProcess>;

  constructor({ application, artifact, endpoint, onStderr }: NativeDesktopHostOptions) {
    if (!artifact.endpoints.includes(endpoint)) {
      throw new TypeError(`Native helper ${artifact.provider} does not support endpoint "${endpoint}".`);
    }
    this.application = Object.freeze({ ...application });
    this.artifact = artifact;
    this.endpoint = endpoint;
    this.onStderr = onStderr;
  }

  async probe(signal?: AbortSignal): Promise<DesktopHostInfo> {
    return this.request('probe', { endpoint: this.endpoint }, signal);
  }

  async launch(target: DesktopTarget, signal?: AbortSignal): Promise<ApplicationLease> {
    return this.request('launch', this.targetParams(target), signal);
  }

  async attach(target: DesktopTarget, signal?: AbortSignal): Promise<ApplicationLease> {
    return this.request('attach', this.targetParams(target), signal);
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
    const includePointer = mode !== 'accessibility';
    if (includePointer) {
      this.potentialButtons = new Set([...this.depressedButtons, 0]);
    }
    try {
      await this.request('click', { elementId, mode }, signal);
    } finally {
      this.potentialButtons = new Set(this.depressedButtons);
    }
  }

  async clear(elementId: string, signal?: AbortSignal): Promise<void> {
    await this.request('clear', { elementId }, signal);
  }

  async sendKeys(elementId: string, text: string, signal?: AbortSignal): Promise<void> {
    this.potentialKeys = new Set([...this.depressedKeys, ...typedTextRecoveryKeys(text)]);
    try {
      await this.request('sendKeys', { elementId, text }, signal);
    } finally {
      this.potentialKeys = new Set(this.depressedKeys);
    }
  }

  async performActions(actions: readonly NativeActionSequence[], signal?: AbortSignal): Promise<void> {
    const plan = planInputLedger(actions, this.depressedKeys, this.depressedButtons);
    this.potentialKeys = plan.potentialKeys;
    this.potentialButtons = plan.potentialButtons;
    try {
      await this.request('performActions', { actions }, signal);
      replaceSet(this.depressedKeys, plan.finalKeys);
      replaceSet(this.depressedButtons, plan.finalButtons);
    } catch (error) {
      this.depressedKeys.clear();
      this.depressedButtons.clear();
      throw error;
    } finally {
      this.potentialKeys = new Set(this.depressedKeys);
      this.potentialButtons = new Set(this.depressedButtons);
    }
  }

  async releaseActions(signal?: AbortSignal): Promise<void> {
    this.potentialKeys = new Set(this.depressedKeys);
    this.potentialButtons = new Set(this.depressedButtons);
    try {
      await this.request('releaseActions', undefined, signal);
    } finally {
      this.depressedKeys.clear();
      this.depressedButtons.clear();
      this.potentialKeys.clear();
      this.potentialButtons.clear();
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

  subscribe(listener: (event: DesktopHostEvent) => void): () => void {
    this.listeners.add(listener);
    void this.getProcess().catch(() => undefined);
    return () => this.listeners.delete(listener);
  }

  async dispose(signal?: AbortSignal): Promise<void> {
    const process = await this.processPromise;
    await process?.dispose(signal);
  }

  private targetParams(target: DesktopTarget): Record<string, unknown> {
    return {
      application: this.application,
      endpoint: target.endpoint,
      renderer: target.renderer,
      storyRootTestId: target.storyRootTestId,
      targetId: target.id,
    };
  }

  private async request<T>(command: string, params?: unknown, signal?: AbortSignal): Promise<T> {
    try {
      const process = await this.getProcess();
      const response = await process.request<T>(command, params, signal);
      return response.result;
    } catch (error) {
      throw translateNativeError(error);
    }
  }

  private async requestImage(command: string, params?: unknown, signal?: AbortSignal): Promise<NativeImage> {
    try {
      const process = await this.getProcess();
      const response = await process.request<Omit<NativeImage, 'data'>>(command, params, signal);
      if (!response.binary) {
        throw new Error(`Native helper did not return binary data for "${command}".`);
      }
      return { ...response.result, data: response.binary };
    } catch (error) {
      throw translateNativeError(error);
    }
  }

  private getProcess(): Promise<NativeHostProcess> {
    if (this.failure) {
      return Promise.reject(this.failure);
    }
    return (this.processPromise ??= NativeHostProcess.start({
      artifact: this.artifact,
      onStderr: this.onStderr,
      recoverInput: () => this.recoverInput(),
    }).then((process) => {
      process.on('event', (message) => this.onEvent(message));
      process.on('exit', (error) => {
        this.failure = error;
        this.processPromise = undefined;
      });
      return process;
    }));
  }

  private recoverInput(): Promise<void> {
    const keys = [...this.potentialKeys];
    const buttons = [...this.potentialButtons];
    if (keys.length === 0 && buttons.length === 0) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const child = spawn(this.artifact.executablePath, ['--release-input'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
      });
      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];
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
              Buffer.concat(stderr).toString('utf8') || stdinError?.message || `Native input recovery exited with code ${String(code)}.`,
            ),
          );
          return;
        }
        try {
          JSON.parse(Buffer.concat(stdout).toString('utf8'));
          this.depressedKeys.clear();
          this.depressedButtons.clear();
          this.potentialKeys.clear();
          this.potentialButtons.clear();
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

const nativeWebDriverErrorCodes: Readonly<Record<string, WebDriverErrorCode>> = {
  'capture-failed': 'unable to capture screen',
  'element-not-interactable': 'element not interactable',
  'invalid-params': 'invalid argument',
  'invalid-request': 'invalid argument',
  'no-such-element': 'no such element',
  'no-such-window': 'no such window',
};

export function translateNativeError(error: unknown): unknown {
  if (!(error instanceof NativeDriverError)) {
    return error;
  }
  if (error.code === 'unsupported-operation') {
    return new HostUnsupportedError(error.message);
  }
  if (error.code === 'stale-element') {
    return new HostStaleError(error.message);
  }
  const webdriverCode = nativeWebDriverErrorCodes[error.code];
  if (webdriverCode) {
    return new HostWebDriverError(webdriverCode, error.message, error.data);
  }
  return error;
}
