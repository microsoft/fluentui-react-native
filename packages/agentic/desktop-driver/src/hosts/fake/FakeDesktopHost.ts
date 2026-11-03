import { randomUUID } from 'node:crypto';

import type {
  ApplicationLease,
  DesktopHost,
  DesktopHostEvent,
  DesktopHostFeatures,
  DesktopHostInfo,
  DesktopTarget,
  DesktopWindow,
  DesktopWindowEventLog,
  NativeElementSnapshot,
  NativeImage,
  NativeActionSequence,
  NativeObservation,
  NativeObserveFact,
  NativeObserveRequest,
  NativeSearchRoot,
  NativeSelector,
  Rect,
} from '../../host/types.js';
import { HostStaleError, HostUnsupportedError, HostWebDriverError } from '../../protocol/errors.js';
import { describeObserveRequestViolation, describeReleaseViolation } from '../../protocol/observation.js';
import { attachFailureEffect, attachProviderQuarantine } from '../../protocol/settlement.js';
import type { MutationEffect } from '../../protocol/settlement.js';
import type { DesktopClickMode, DesktopEndpoint, DesktopPlatformName } from '../../protocol/types.js';
import { sampleTree } from './observeTree.js';

export type FakeDesktopElement = Omit<
  NativeElementSnapshot,
  'checked' | 'enabled' | 'expanded' | 'focused' | 'required' | 'selected' | 'visible'
> & {
  /** Names reported by `accessibilityActions` when the fake host advertises that feature. */
  accessibilityActions?: readonly string[];
  checked?: boolean | 'mixed';
  enabled?: boolean;
  expanded?: boolean;
  focused?: boolean;
  required?: boolean;
  /** A password or secure field: bounded observation never reports its value or text. */
  secure?: boolean;
  selected?: boolean;
  visible?: boolean;
};

export type FakeDesktopWindow = Omit<DesktopWindow, 'rect'> & {
  elements: readonly FakeDesktopElement[];
  rect?: Rect;
};

/** Host commands that change application or input state and so settle into a mutation effect. */
export type FakeMutation =
  | 'activate'
  | 'clear'
  | 'click'
  | 'closeWindow'
  | 'performActions'
  | 'releaseActions'
  | 'sendKeys'
  | 'setWindowRect';

/**
 * A scripted provider failure for a mutating command. Modes:
 *
 * - `reject`: fails at dispatch without changing anything. The reported effect defaults to `none`.
 * - `hang`: changes nothing and never answers until the driver aborts it. The reported effect defaults to `unknown`.
 * - `lost-response`: applies the change, then never answers until the driver aborts it. The reported effect defaults to
 *   `unknown`, which models a provider that cannot tell whether the change landed.
 * - `late-success`: ignores the abort and applies the change after `delayMs`, so the driver sees a timeout for a command
 *   that took effect.
 *
 * `effect: 'unreported'` models a provider that attaches no effect to its failure. `providerQuarantined` models a
 * provider that quarantined itself earlier and reports that on this failure, as a refusal that dispatched nothing.
 */
export type FakeFault = {
  delayMs?: number;
  effect?: MutationEffect | 'unreported';
  mode: 'hang' | 'late-success' | 'lost-response' | 'reject';
  providerQuarantined?: boolean;
  /** How many calls the fault applies to before the command behaves normally again. Defaults to 1. */
  times?: number;
};

export type FakeDesktopHostOptions = {
  actionDelayMs?: number;
  closeDelayMs?: number;
  endpoint?: DesktopEndpoint;
  faults?: Partial<Record<FakeMutation, FakeFault>>;
  features?: Partial<DesktopHostFeatures>;
  launchDelayMs?: number;
  /** Tunables for the bounded-observation model, used when `features.boundedObservation` is on. */
  observation?: FakeObservationOptions;
  platformName?: DesktopPlatformName;
  screenshot?: Uint8Array;
  storyRootTestId?: string;
  windows?: readonly FakeDesktopWindow[];
};

export type FakeObservationOptions = {
  /** How many element records the fake keeps before an observation stops with `references`. Defaults to 10,000. */
  maxElementRecords?: number;
  /** Time each element read takes, modelling a slow accessibility provider. */
  readDelayMs?: number;
  /** Elements whose children the provider cannot read, so a sample reports them `unknown`. */
  unreadableChildrenOf?: readonly string[];
};

const onePixelPng = Uint8Array.from(
  Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
);

const defaultRect = { x: 0, y: 0, width: 800, height: 600 };
const defaultFeatures: DesktopHostFeatures = {
  accessibilityClick: true,
  elementScreenshot: true,
  focus: true,
  keyboard: true,
  physicalClick: true,
  screenshot: true,
  setWindowRect: true,
  wheel: true,
};

export class FakeDesktopHost implements DesktopHost {
  readonly endpoint: DesktopEndpoint;
  readonly actions: Record<string, unknown>[] = [];

  private readonly platformName: DesktopPlatformName;
  private readonly actionDelayMs: number;
  private readonly closeDelayMs: number;
  private readonly features: DesktopHostFeatures;
  private readonly launchDelayMs: number;
  private readonly observation: Required<FakeObservationOptions>;
  private readonly screenshot: Uint8Array;
  private readonly windowsById = new Map<string, DesktopWindow>();
  private readonly elements = new Map<string, NativeElementSnapshot>();
  private readonly initialElements = new Map<string, NativeElementSnapshot>();
  private readonly listeners = new Set<(event: DesktopHostEvent) => void>();
  private readonly faults = new Map<FakeMutation, { fault: FakeFault; remaining: number }>();
  private readonly windowEventLog: { at: number; notification: string; sequence: number; windowId: string }[] = [];
  // Element ids the fake has issued. A released or forgotten id stays dead and is never issued again, as in a helper.
  private readonly recordTargets = new Map<string, string>();
  private readonly recordsByElement = new Map<string, string>();
  private readonly releasedRecords = new Set<string>();
  private recordSequence = 0;

  constructor(options: FakeDesktopHostOptions = {}) {
    this.endpoint = options.endpoint ?? 'windows';
    this.actionDelayMs = options.actionDelayMs ?? 0;
    this.closeDelayMs = options.closeDelayMs ?? 0;
    this.platformName = options.platformName ?? (this.endpoint === 'macos' ? 'macos' : 'windows');
    this.features = { ...defaultFeatures, ...options.features };
    this.launchDelayMs = options.launchDelayMs ?? 0;
    this.observation = { maxElementRecords: 10_000, readDelayMs: 0, unreadableChildrenOf: [], ...options.observation };
    this.screenshot = options.screenshot ?? onePixelPng;
    for (const [command, fault] of Object.entries(options.faults ?? {}) as [FakeMutation, FakeFault][]) {
      this.injectFault(command, fault);
    }

    const windows = options.windows ?? [createDefaultWindow(options.storyRootTestId)];
    for (const window of windows) {
      this.windowsById.set(window.id, {
        id: window.id,
        title: window.title,
        rect: { ...defaultRect, ...window.rect },
      });
      for (const element of window.elements) {
        this.elements.set(element.id, toSnapshot(element));
      }
    }
    for (const [id, element] of this.elements) {
      this.initialElements.set(id, cloneElement(element));
    }
  }

  setElementName(elementId: string, name: string): void {
    this.requireElement(elementId).name = name;
  }

  /** Scripts a provider failure for the next `fault.times` calls (default 1) of a mutating command. */
  injectFault(command: FakeMutation, fault: FakeFault): void {
    this.faults.set(command, { fault, remaining: fault.times ?? 1 });
  }

  clearFaults(): void {
    this.faults.clear();
  }

  /**
   * Runs a mutating command. A scripted fault replaces the normal outcome; otherwise `apply` runs and any rejection it
   * raises is a definitive pre-dispatch rejection, as a well-behaved provider would report. `apply` receives the abort
   * signal the command should honor, which a late success deliberately lacks.
   */
  private async mutate<T>(
    command: FakeMutation,
    signal: AbortSignal | undefined,
    apply: (observed: AbortSignal | undefined) => T | Promise<T>,
  ): Promise<T> {
    const scripted = this.faults.get(command);
    if (!scripted) {
      return apply(signal);
    }
    const { fault } = scripted;
    scripted.remaining -= 1;
    if (scripted.remaining <= 0) {
      this.faults.delete(command);
    }
    this.actions.push({ type: 'fault', command, mode: fault.mode });
    switch (fault.mode) {
      case 'reject': {
        const failure = reportEffect(new Error(`Injected ${command} failure.`), fault.effect ?? 'none');
        throw fault.providerQuarantined ? attachProviderQuarantine(failure) : failure;
      }
      case 'hang':
        return untilAborted(signal, fault.effect ?? 'unknown');
      case 'lost-response':
        await apply(signal);
        return untilAborted(signal, fault.effect ?? 'unknown');
      case 'late-success':
        await new Promise<void>((resolve) => setTimeout(resolve, fault.delayMs ?? 0));
        return apply(undefined);
    }
  }

  setElementStateUnsupported(
    elementId: string,
    state: 'checked' | 'enabled' | 'expanded' | 'focused' | 'required' | 'selected' | 'visible',
    reason: string,
  ): void {
    const update = (element: NativeElementSnapshot) => {
      switch (state) {
        case 'checked':
          element.checked = { supported: false, reason };
          break;
        case 'enabled':
          element.enabled = { supported: false, reason };
          break;
        case 'expanded':
          element.expanded = { supported: false, reason };
          break;
        case 'focused':
          element.focused = { supported: false, reason };
          break;
        case 'required':
          element.required = { supported: false, reason };
          break;
        case 'selected':
          element.selected = { supported: false, reason };
          break;
        case 'visible':
          element.visible = { supported: false, reason };
          break;
      }
    };
    update(this.requireElement(elementId));
    const initial = this.initialElements.get(elementId);
    if (initial) {
      update(initial);
    }
  }

  async probe(signal?: AbortSignal): Promise<DesktopHostInfo> {
    throwIfAborted(signal);
    return {
      endpoint: this.endpoint,
      features: { ...this.features },
      platformName: this.platformName,
      protocolVersion: 1,
    };
  }

  async launch(target: DesktopTarget, signal?: AbortSignal): Promise<ApplicationLease> {
    this.actions.push({ type: 'launch', target: target.id });
    await delay(this.launchDelayMs, signal);
    return { id: randomUUID(), ownership: 'launched', processId: 1000, processStartedAt: new Date(0).toISOString() };
  }

  async attach(target: DesktopTarget, signal?: AbortSignal): Promise<ApplicationLease> {
    this.actions.push({ type: 'attach', target: target.id });
    await delay(this.launchDelayMs, signal);
    return { id: randomUUID(), ownership: 'attached', processId: 1000, processStartedAt: new Date(0).toISOString() };
  }

  async closeApplication(lease: ApplicationLease, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    this.actions.push({ type: 'close-application-start', lease: lease.id });
    await delay(this.closeDelayMs, signal);
    this.actions.push({ type: 'close-application', lease: lease.id, ownership: lease.ownership });
  }

  async windows(_lease: ApplicationLease): Promise<DesktopWindow[]> {
    return [...this.windowsById.values()].map(cloneWindow);
  }

  async closeWindow(windowId: string, signal?: AbortSignal): Promise<void> {
    return this.mutate('closeWindow', signal, () => {
      if (!this.windowsById.delete(windowId)) {
        throw reportEffect(new HostStaleError(`Window "${windowId}" is no longer available.`), 'none');
      }
      for (const [id, element] of this.elements) {
        if (element.windowId === windowId) {
          this.deleteElement(id);
        }
      }
      this.windowEventLog.push({ at: Date.now(), notification: 'window-closed', sequence: this.windowEventLog.length + 1, windowId });
      for (const listener of this.listeners) {
        listener({ type: 'window-closed', windowId });
      }
    });
  }

  async windowEvents(_lease: ApplicationLease): Promise<DesktopWindowEventLog> {
    if (!this.features.windowEvents) {
      throw new HostUnsupportedError('The fake host is not configured to record window events.');
    }
    const now = Date.now();
    return {
      events: this.windowEventLog.map(({ at, notification, sequence, windowId }) => ({
        ageMs: now - at,
        element: `fake:${windowId}`,
        notification,
        sequence,
        windowId,
      })),
      eventsTruncated: false,
      observing: true,
      source: 'fake',
    };
  }

  async accessibilityActions(elementId: string): Promise<string[]> {
    if (!this.features.accessibilityActions) {
      throw new HostUnsupportedError('The fake host is not configured to list accessibility actions.');
    }
    const element = this.requireElement(elementId) as Pick<FakeDesktopElement, 'accessibilityActions'>;
    return [...(element.accessibilityActions ?? [])];
  }

  async observe(request: NativeObserveRequest, signal?: AbortSignal): Promise<NativeObservation> {
    if (!this.features.boundedObservation) {
      throw new HostUnsupportedError('The fake host is not configured for bounded observation.');
    }
    throwIfAborted(signal);
    const violation = describeObserveRequestViolation(request);
    if (violation) {
      throw new HostWebDriverError('invalid argument', violation);
    }
    this.requireWindow(request.windowId);
    const root = request.rootId ? this.requireElement(request.rootId) : this.windowRoot(request.windowId);
    if (!root || root.windowId !== request.windowId) {
      throw new HostStaleError(`Element "${request.rootId ?? request.windowId}" is no longer available in this window.`);
    }
    const childrenByParent = new Map<string, NativeElementSnapshot[]>();
    for (const element of this.elements.values()) {
      if (element.parentId !== undefined) {
        childrenByParent.set(element.parentId, [...(childrenByParent.get(element.parentId) ?? []), element]);
      }
    }
    const unsupportedFacts = new Set<NativeObserveFact>(this.features.accessibilityActions ? [] : ['actions']);
    return sampleTree(
      root,
      request,
      {
        childrenOf: (elementId) => childrenByParent.get(elementId) ?? [],
        extras: (elementId) => {
          const element = this.elements.get(elementId) as Pick<FakeDesktopElement, 'accessibilityActions' | 'secure'> | undefined;
          return { actions: element?.accessibilityActions, secure: element?.secure };
        },
        recordFor: (elementId) => this.recordFor(elementId, true),
      },
      {
        beforeRead: () => {
          if (this.observation.readDelayMs > 0) {
            return delay(this.observation.readDelayMs, signal);
          }
          throwIfAborted(signal);
          return Promise.resolve();
        },
        unreadableChildrenOf: new Set(this.observation.unreadableChildrenOf),
        unsupportedFacts,
      },
    );
  }

  async releaseElements(elementIds: readonly string[], signal?: AbortSignal): Promise<number> {
    if (!this.features.boundedObservation) {
      throw new HostUnsupportedError('The fake host is not configured for bounded observation.');
    }
    throwIfAborted(signal);
    const violation = describeReleaseViolation(elementIds);
    if (violation) {
      throw new HostWebDriverError('invalid argument', violation);
    }
    return elementIds.filter((id) => this.releaseRecord(id)).length;
  }

  /** The number of element ids the fake currently tracks, for asserting that retention reaches a plateau. */
  get trackedElementCount(): number {
    return this.recordTargets.size;
  }

  async activate(windowId: string, signal?: AbortSignal): Promise<void> {
    return this.mutate('activate', signal, () => {
      this.requireWindow(windowId);
      this.actions.push({ type: 'activate', windowId });
    });
  }

  async getWindowRect(windowId: string): Promise<Rect> {
    return { ...this.requireWindow(windowId).rect };
  }

  async setWindowRect(windowId: string, rect: Partial<Rect>, signal?: AbortSignal): Promise<Rect> {
    return this.mutate('setWindowRect', signal, () => {
      if (!this.features.setWindowRect) {
        throw reportEffect(new HostUnsupportedError('The fake target does not support setting the window rectangle.'), 'none');
      }
      const window = this.requireWindow(windowId);
      window.rect = { ...window.rect, ...rect };
      return { ...window.rect };
    });
  }

  async find(root: NativeSearchRoot, selector: NativeSelector): Promise<NativeElementSnapshot[]> {
    this.requireWindow(root.windowId);
    const rootElement = root.elementId ? this.requireElement(root.elementId) : undefined;

    return [...this.elements.values()]
      .filter((element) => element.windowId === root.windowId)
      .filter((element) => !rootElement || isDescendantOf(element, rootElement.id, this.elements))
      .filter((element) => matches(element, selector))
      .map((element) => this.expose(element));
  }

  async snapshot(elementId: string): Promise<NativeElementSnapshot> {
    return this.expose(this.requireElement(elementId));
  }

  async activeElement(windowId: string): Promise<NativeElementSnapshot | null> {
    this.requireWindow(windowId);
    const focused = [...this.elements.values()].find(
      (element) => element.windowId === windowId && element.focused.supported && element.focused.value,
    );
    return focused ? this.expose(focused) : null;
  }

  async hitTest(windowId: string, x: number, y: number): Promise<NativeElementSnapshot | null> {
    this.requireWindow(windowId);
    const matchesPoint = [...this.elements.values()].filter(
      (element) =>
        element.windowId === windowId &&
        isSupportedTrue(element.visible) &&
        x >= element.rect.x &&
        y >= element.rect.y &&
        x <= element.rect.x + element.rect.width &&
        y <= element.rect.y + element.rect.height,
    );
    const element = matchesPoint.at(-1);
    return element ? this.expose(element) : null;
  }

  async click(elementId: string, mode: DesktopClickMode, signal?: AbortSignal): Promise<void> {
    return this.mutate('click', signal, (observed) => {
      throwIfAborted(observed);
      const element = this.requireElement(elementId);
      const resolvedMode =
        mode === 'auto'
          ? this.features.physicalClick
            ? 'physical'
            : this.features.accessibilityClick
              ? 'accessibility'
              : undefined
          : mode;
      if (
        !resolvedMode ||
        (resolvedMode === 'physical' && !this.features.physicalClick) ||
        (resolvedMode === 'accessibility' && !this.features.accessibilityClick)
      ) {
        throw reportEffect(new HostUnsupportedError(`Click mode "${mode}" is unavailable.`), 'none');
      }
      for (const current of this.elements.values()) {
        if (current.windowId === element.windowId && current.focused.supported) {
          current.focused = { supported: true, value: current.id === element.id };
        }
      }
      if (element.role === 'checkbox' && element.checked.supported) {
        element.checked = { supported: true, value: element.checked.value === true ? false : true };
      }
      this.actions.push({ type: 'click', elementId, mode: resolvedMode });
    });
  }

  async clear(elementId: string, signal?: AbortSignal): Promise<void> {
    return this.mutate('clear', signal, (observed) => {
      throwIfAborted(observed);
      const element = this.requireElement(elementId);
      element.value = '';
      element.text = '';
      this.actions.push({ type: 'clear', elementId });
    });
  }

  async sendKeys(elementId: string, text: string, signal?: AbortSignal): Promise<void> {
    return this.mutate('sendKeys', signal, (observed) => {
      throwIfAborted(observed);
      const element = this.requireElement(elementId);
      element.value = `${element.value ?? ''}${text}`;
      element.text = element.value;
      this.actions.push({ type: 'send-keys', elementId, text });
    });
  }

  async performActions(actions: readonly NativeActionSequence[], signal?: AbortSignal): Promise<void> {
    return this.mutate('performActions', signal, async (observed) => {
      this.actions.push({ type: 'actions-start' });
      await delay(this.actionDelayMs, observed);
      this.actions.push({ type: 'actions', actions });
    });
  }

  async releaseActions(signal?: AbortSignal): Promise<void> {
    return this.mutate('releaseActions', signal, (observed) => {
      throwIfAborted(observed);
      this.actions.push({ type: 'release-actions' });
    });
  }

  async captureWindow(windowId: string): Promise<NativeImage> {
    this.requireWindow(windowId);
    if (!this.features.screenshot) {
      throw new HostUnsupportedError('The fake target does not support screenshots.');
    }
    return createImage(this.screenshot);
  }

  async captureElement(elementId: string): Promise<NativeImage> {
    this.requireElement(elementId);
    if (!this.features.elementScreenshot) {
      throw new HostUnsupportedError('The fake target does not support element screenshots.');
    }
    return createImage(this.screenshot);
  }

  async source(windowId: string): Promise<string> {
    this.requireWindow(windowId);
    const roots = [...this.elements.values()].filter((element) => element.windowId === windowId && !element.parentId);
    return `<application>${roots.map((element) => serializeElement(element, this.elements)).join('')}</application>`;
  }

  async tree(windowId: string): Promise<NativeElementSnapshot[]> {
    this.requireWindow(windowId);
    return [...this.elements.values()].filter((element) => element.windowId === windowId).map((element) => this.expose(element));
  }

  subscribe(listener: (event: DesktopHostEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async dispose(signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    this.listeners.clear();
    this.actions.push({ type: 'dispose' });
  }

  /** Adds an element after construction, as when an app renders new content. */
  addElement(element: FakeDesktopElement): void {
    this.elements.set(element.id, toSnapshot(element));
  }

  removeElement(elementId: string): void {
    if (this.deleteElement(elementId)) {
      for (const [id, element] of this.elements) {
        if (element.parentId === elementId) {
          this.removeElement(id);
        }
      }
    }
  }

  replacePreview(elements: readonly FakeDesktopElement[]): void {
    for (const [id, element] of this.elements) {
      if (element.scope === 'preview') {
        this.deleteElement(id);
      }
    }
    for (const element of elements) {
      this.elements.set(element.id, toSnapshot(element));
    }
    for (const windowId of new Set(elements.map((element) => element.windowId))) {
      for (const listener of this.listeners) {
        listener({ type: 'structure-changed', windowId });
      }
    }
  }

  resetPreview(): void {
    for (const [id, element] of this.elements) {
      if (element.scope === 'preview') {
        this.deleteElement(id);
      }
    }
    for (const [id, element] of this.initialElements) {
      if (element.scope === 'preview') {
        this.elements.set(id, cloneElement(element));
      }
    }
  }

  private requireWindow(windowId: string): DesktopWindow {
    const window = this.windowsById.get(windowId);
    if (!window) {
      throw reportEffect(new HostStaleError(`Window "${windowId}" is no longer available.`), 'none');
    }
    return window;
  }

  private requireElement(elementId: string): NativeElementSnapshot {
    const element = this.resolveElement(elementId);
    if (!element) {
      throw reportEffect(new HostStaleError(`Element "${elementId}" is no longer available.`), 'none');
    }
    return element;
  }

  /**
   * Resolves an id a client holds. With bounded observation on, an id the fake issued stays bound to the element it
   * named: once released, or once its element is deleted, it is stale for good even if an element with the same
   * authored id returns, which then gets a fresh id.
   */
  private resolveElement(id: string): NativeElementSnapshot | undefined {
    if (!this.features.boundedObservation) {
      return this.elements.get(id);
    }
    if (this.releasedRecords.has(id)) {
      return undefined;
    }
    return this.elements.get(this.recordTargets.get(id) ?? id);
  }

  private windowRoot(windowId: string): NativeElementSnapshot | undefined {
    return [...this.elements.values()].find((element) => element.windowId === windowId && element.parentId === undefined);
  }

  /** A copy of an element carrying the ids the fake issued, which `observe` shares so every command agrees on identity. */
  private expose(element: NativeElementSnapshot): NativeElementSnapshot {
    const snapshot = cloneElement(element);
    if (!this.features.boundedObservation) {
      return snapshot;
    }
    snapshot.id = this.recordFor(element.id, false);
    if (element.parentId !== undefined && this.elements.has(element.parentId)) {
      snapshot.parentId = this.recordFor(element.parentId, false);
    }
    return snapshot;
  }

  /**
   * The id issued for an element: its authored id the first time, then a fresh alias once an earlier id was released.
   * Returns `undefined` when `enforceCapacity` is set and the element table is full.
   */
  private recordFor(elementId: string, enforceCapacity: boolean): string | undefined {
    const live = this.recordsByElement.get(elementId);
    if (live !== undefined) {
      return live;
    }
    if (enforceCapacity && this.recordTargets.size >= this.observation.maxElementRecords) {
      return undefined;
    }
    let recordId = elementId;
    while (this.releasedRecords.has(recordId) || this.recordTargets.has(recordId)) {
      this.recordSequence += 1;
      recordId = `${elementId}~${this.recordSequence}`;
    }
    this.recordTargets.set(recordId, elementId);
    this.recordsByElement.set(elementId, recordId);
    return recordId;
  }

  private releaseRecord(recordId: string): boolean {
    const elementId = this.recordTargets.get(recordId);
    if (elementId === undefined) {
      return false;
    }
    this.recordTargets.delete(recordId);
    this.recordsByElement.delete(elementId);
    this.releasedRecords.add(recordId);
    return true;
  }

  private deleteElement(elementId: string): boolean {
    const recordId = this.recordsByElement.get(elementId);
    if (recordId !== undefined) {
      this.releaseRecord(recordId);
    }
    return this.elements.delete(elementId);
  }
}

function createDefaultWindow(storyRootTestId = 'story-root'): FakeDesktopWindow {
  return {
    id: 'window-1',
    title: 'Fake Desktop App',
    elements: [
      {
        id: 'root',
        automationId: 'app-root',
        enabled: true,
        focused: false,
        rect: defaultRect,
        role: 'application',
        scope: 'application',
        selected: false,
        visible: true,
        windowId: 'window-1',
      },
      {
        id: 'story-root',
        automationId: storyRootTestId,
        enabled: true,
        focused: false,
        name: JSON.stringify({ previewGeneration: 0, storyId: 'initial--story' }),
        parentId: 'root',
        rect: defaultRect,
        role: 'group',
        scope: 'preview',
        selected: false,
        visible: true,
        windowId: 'window-1',
      },
      {
        id: 'button',
        automationId: 'button-primary',
        enabled: true,
        focused: false,
        name: 'Primary',
        parentId: 'root',
        rect: { x: 10, y: 10, width: 120, height: 40 },
        role: 'button',
        scope: 'preview',
        selected: false,
        text: 'Primary',
        visible: true,
        windowId: 'window-1',
      },
      {
        id: 'input',
        automationId: 'input-name',
        enabled: true,
        focused: false,
        name: 'Name',
        parentId: 'root',
        rect: { x: 10, y: 60, width: 200, height: 40 },
        role: 'textbox',
        scope: 'preview',
        selected: false,
        value: '',
        visible: true,
        windowId: 'window-1',
      },
    ],
  };
}

function toSnapshot(element: FakeDesktopElement): NativeElementSnapshot {
  return {
    ...element,
    rect: { ...element.rect },
    checked: { supported: true, value: element.checked ?? false },
    enabled: { supported: true, value: element.enabled ?? true },
    expanded: { supported: true, value: element.expanded ?? false },
    focused: { supported: true, value: element.focused ?? false },
    required: element.required === undefined ? undefined : { supported: true, value: element.required },
    selected: { supported: true, value: element.selected ?? false },
    visible: { supported: true, value: element.visible ?? true },
  };
}

function cloneElement(element: NativeElementSnapshot): NativeElementSnapshot {
  return {
    ...element,
    rect: { ...element.rect },
    checked: { ...element.checked },
    enabled: { ...element.enabled },
    expanded: { ...element.expanded },
    focused: { ...element.focused },
    required: element.required ? { ...element.required } : undefined,
    selected: { ...element.selected },
    visible: { ...element.visible },
  };
}

function cloneWindow(window: DesktopWindow): DesktopWindow {
  return { ...window, rect: { ...window.rect } };
}

function isDescendantOf(element: NativeElementSnapshot, ancestorId: string, elements: ReadonlyMap<string, NativeElementSnapshot>): boolean {
  let parentId = element.parentId;
  while (parentId) {
    if (parentId === ancestorId) {
      return true;
    }
    parentId = elements.get(parentId)?.parentId;
  }
  return false;
}

function matches(element: NativeElementSnapshot, selector: NativeSelector): boolean {
  switch (selector.strategy) {
    case '-furn:text':
      return element.text?.includes(selector.value) ?? element.value?.includes(selector.value) ?? false;
    case 'accessibility id':
      return element.automationId === selector.value;
    case 'tag name':
      return element.role === selector.value;
    case 'link text':
      return element.name === selector.value;
    case 'partial link text':
      return element.name?.includes(selector.value) ?? false;
  }
}

function isSupportedTrue(value: NativeElementSnapshot['visible']): boolean {
  return value.supported && value.value;
}

function createImage(data: Uint8Array): NativeImage {
  return { data: Uint8Array.from(data), height: 1, mimeType: 'image/png', scaleFactor: 1, width: 1 };
}

function serializeElement(element: NativeElementSnapshot, elements: ReadonlyMap<string, NativeElementSnapshot>): string {
  const attributes = [
    `id="${escapeXml(element.automationId ?? '')}"`,
    `name="${escapeXml(element.name ?? '')}"`,
    `role="${escapeXml(element.role)}"`,
  ].join(' ');
  const children = [...elements.values()]
    .filter((candidate) => candidate.parentId === element.id)
    .map((child) => serializeElement(child, elements))
    .join('');
  return `<element ${attributes}>${children}</element>`;
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function reportEffect<T extends Error>(error: T, effect: MutationEffect | 'unreported'): T {
  return effect === 'unreported' ? error : attachFailureEffect(error, effect);
}

function createAbortError(signal: AbortSignal | undefined, effect: MutationEffect | 'unreported'): Error {
  const error = new Error('Fake desktop host operation was aborted.', { cause: signal?.reason });
  error.name = 'AbortError';
  return reportEffect(error, effect);
}

/** Never settles until the driver aborts the command, then fails with the effect a provider would report. */
function untilAborted(signal: AbortSignal | undefined, effect: MutationEffect | 'unreported'): Promise<never> {
  return new Promise<never>((_resolve, reject) => {
    if (!signal) {
      return;
    }
    if (signal.aborted) {
      reject(createAbortError(signal, effect));
      return;
    }
    signal.addEventListener('abort', () => reject(createAbortError(signal, effect)), { once: true });
  });
}

// An abort observed before the fake records a change leaves nothing behind.
function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw createAbortError(signal, 'none');
  }
}

function delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  throwIfAborted(signal);
  if (!signal) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, milliseconds);
    const onAbort = () => {
      clearTimeout(timer);
      reject(createAbortError(signal, 'none'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}
