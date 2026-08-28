import { randomUUID } from 'node:crypto';

import type {
  ApplicationLease,
  DesktopHost,
  DesktopHostEvent,
  DesktopHostFeatures,
  DesktopHostInfo,
  DesktopTarget,
  DesktopWindow,
  NativeElementSnapshot,
  NativeImage,
  NativeSearchRoot,
  NativeSelector,
  Rect,
} from '../../host/types.js';
import { HostStaleError, HostUnsupportedError } from '../../protocol/errors.js';
import type { DesktopClickMode, DesktopEndpoint, DesktopPlatformName, WebDriverActionSequence } from '../../protocol/types.js';

export type FakeDesktopElement = Omit<NativeElementSnapshot, 'enabled' | 'focused' | 'selected' | 'visible'> & {
  enabled?: boolean;
  focused?: boolean;
  selected?: boolean;
  visible?: boolean;
};

export type FakeDesktopWindow = Omit<DesktopWindow, 'rect'> & {
  elements: readonly FakeDesktopElement[];
  rect?: Rect;
};

export type FakeDesktopHostOptions = {
  endpoint?: DesktopEndpoint;
  features?: Partial<DesktopHostFeatures>;
  launchDelayMs?: number;
  platformName?: DesktopPlatformName;
  screenshot?: Uint8Array;
  storyRootTestId?: string;
  windows?: readonly FakeDesktopWindow[];
};

const onePixelPng = Uint8Array.from(
  Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
);

const defaultRect = { x: 0, y: 0, width: 800, height: 600 };
const defaultFeatures: DesktopHostFeatures = {
  accessibilityClick: true,
  elementScreenshot: true,
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
  private readonly features: DesktopHostFeatures;
  private readonly launchDelayMs: number;
  private readonly screenshot: Uint8Array;
  private readonly windowsById = new Map<string, DesktopWindow>();
  private readonly elements = new Map<string, NativeElementSnapshot>();
  private readonly listeners = new Set<(event: DesktopHostEvent) => void>();

  constructor(options: FakeDesktopHostOptions = {}) {
    this.endpoint = options.endpoint ?? 'windows';
    this.platformName = options.platformName ?? (this.endpoint === 'macos' ? 'macos' : 'windows');
    this.features = { ...defaultFeatures, ...options.features };
    this.launchDelayMs = options.launchDelayMs ?? 0;
    this.screenshot = options.screenshot ?? onePixelPng;

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
  }

  setElementName(elementId: string, name: string): void {
    this.requireElement(elementId).name = name;
  }

  async probe(): Promise<DesktopHostInfo> {
    return {
      endpoint: this.endpoint,
      features: { ...this.features },
      platformName: this.platformName,
      protocolVersion: 1,
    };
  }

  async launch(target: DesktopTarget): Promise<ApplicationLease> {
    this.actions.push({ type: 'launch', target: target.id });
    await delay(this.launchDelayMs);
    return { id: randomUUID(), ownership: 'launched', processId: 1000, processStartedAt: new Date(0).toISOString() };
  }

  async attach(target: DesktopTarget): Promise<ApplicationLease> {
    this.actions.push({ type: 'attach', target: target.id });
    await delay(this.launchDelayMs);
    return { id: randomUUID(), ownership: 'attached', processId: 1000, processStartedAt: new Date(0).toISOString() };
  }

  async closeApplication(lease: ApplicationLease): Promise<void> {
    this.actions.push({ type: 'close-application', lease: lease.id, ownership: lease.ownership });
  }

  async windows(_lease: ApplicationLease): Promise<DesktopWindow[]> {
    return [...this.windowsById.values()].map(cloneWindow);
  }

  async closeWindow(windowId: string): Promise<void> {
    if (!this.windowsById.delete(windowId)) {
      throw new HostStaleError(`Window "${windowId}" is no longer available.`);
    }
    for (const [id, element] of this.elements) {
      if (element.windowId === windowId) {
        this.elements.delete(id);
      }
    }
    for (const listener of this.listeners) {
      listener({ type: 'window-closed', windowId });
    }
  }

  async activate(windowId: string): Promise<void> {
    this.requireWindow(windowId);
    this.actions.push({ type: 'activate', windowId });
  }

  async getWindowRect(windowId: string): Promise<Rect> {
    return { ...this.requireWindow(windowId).rect };
  }

  async setWindowRect(windowId: string, rect: Partial<Rect>): Promise<Rect> {
    if (!this.features.setWindowRect) {
      throw new HostUnsupportedError('The fake target does not support setting the window rectangle.');
    }
    const window = this.requireWindow(windowId);
    window.rect = { ...window.rect, ...rect };
    return { ...window.rect };
  }

  async find(root: NativeSearchRoot, selector: NativeSelector): Promise<NativeElementSnapshot[]> {
    this.requireWindow(root.windowId);
    if (root.elementId) {
      this.requireElement(root.elementId);
    }

    return [...this.elements.values()]
      .filter((element) => element.windowId === root.windowId)
      .filter((element) => !root.elementId || isDescendantOf(element, root.elementId, this.elements))
      .filter((element) => matches(element, selector))
      .map(cloneElement);
  }

  async snapshot(elementId: string): Promise<NativeElementSnapshot> {
    return cloneElement(this.requireElement(elementId));
  }

  async activeElement(windowId: string): Promise<NativeElementSnapshot | null> {
    this.requireWindow(windowId);
    const focused = [...this.elements.values()].find(
      (element) => element.windowId === windowId && element.focused.supported && element.focused.value,
    );
    return focused ? cloneElement(focused) : null;
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
    return element ? cloneElement(element) : null;
  }

  async click(elementId: string, mode: DesktopClickMode): Promise<void> {
    const element = this.requireElement(elementId);
    const resolvedMode =
      mode === 'auto' ? (this.features.physicalClick ? 'physical' : this.features.accessibilityClick ? 'accessibility' : undefined) : mode;
    if (
      !resolvedMode ||
      (resolvedMode === 'physical' && !this.features.physicalClick) ||
      (resolvedMode === 'accessibility' && !this.features.accessibilityClick)
    ) {
      throw new HostUnsupportedError(`Click mode "${mode}" is unavailable.`);
    }
    for (const current of this.elements.values()) {
      if (current.windowId === element.windowId && current.focused.supported) {
        current.focused = { supported: true, value: current.id === element.id };
      }
    }
    this.actions.push({ type: 'click', elementId, mode: resolvedMode });
  }

  async clear(elementId: string): Promise<void> {
    const element = this.requireElement(elementId);
    element.value = '';
    element.text = '';
    this.actions.push({ type: 'clear', elementId });
  }

  async sendKeys(elementId: string, text: string): Promise<void> {
    const element = this.requireElement(elementId);
    element.value = `${element.value ?? ''}${text}`;
    element.text = element.value;
    this.actions.push({ type: 'send-keys', elementId, text });
  }

  async performActions(actions: readonly WebDriverActionSequence[]): Promise<void> {
    this.actions.push({ type: 'actions', actions });
  }

  async releaseActions(): Promise<void> {
    this.actions.push({ type: 'release-actions' });
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

  subscribe(listener: (event: DesktopHostEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async dispose(): Promise<void> {
    this.listeners.clear();
    this.actions.push({ type: 'dispose' });
  }

  removeElement(elementId: string): void {
    if (this.elements.delete(elementId)) {
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
        this.elements.delete(id);
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

  private requireWindow(windowId: string): DesktopWindow {
    const window = this.windowsById.get(windowId);
    if (!window) {
      throw new HostStaleError(`Window "${windowId}" is no longer available.`);
    }
    return window;
  }

  private requireElement(elementId: string): NativeElementSnapshot {
    const element = this.elements.get(elementId);
    if (!element) {
      throw new HostStaleError(`Element "${elementId}" is no longer available.`);
    }
    return element;
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
    enabled: { supported: true, value: element.enabled ?? true },
    focused: { supported: true, value: element.focused ?? false },
    selected: { supported: true, value: element.selected ?? false },
    visible: { supported: true, value: element.visible ?? true },
  };
}

function cloneElement(element: NativeElementSnapshot): NativeElementSnapshot {
  return {
    ...element,
    rect: { ...element.rect },
    enabled: { ...element.enabled },
    focused: { ...element.focused },
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

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
