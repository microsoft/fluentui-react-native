import type { DesktopClickMode, DesktopEndpoint, DesktopPlatformName, DesktopRenderer } from '../protocol/types.js';
import type { WebDriverAction, WebDriverActionSequence } from '../protocol/types.js';
import type { StoryOrchestrator } from '../storybook.js';

export type Rect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type SupportedValue<T> = { supported: true; value: T } | { supported: false; reason: string };

export type DesktopHostFeatures = {
  accessibilityClick: boolean;
  elementScreenshot: boolean;
  focus: boolean;
  keyboard: boolean;
  physicalClick: boolean;
  screenshot: boolean;
  setWindowRect: boolean;
  wheel: boolean;
};

export type DesktopHostInfo = {
  endpoint: DesktopEndpoint;
  features: DesktopHostFeatures;
  platformName: DesktopPlatformName;
  protocolVersion: 1;
};

export type ApplicationLease = {
  id: string;
  ownership: 'attached' | 'launched';
  processId?: number;
  processStartedAt?: string;
};

export type DesktopWindow = {
  id: string;
  rect: Rect;
  title: string;
};

export type NativeElementScope = 'application' | 'chrome' | 'preview' | 'secondary-window';

export type NativeElementSnapshot = {
  id: string;
  automationId?: string;
  checked: SupportedValue<boolean | 'mixed'>;
  enabled: SupportedValue<boolean>;
  expanded: SupportedValue<boolean>;
  focused: SupportedValue<boolean>;
  name?: string;
  parentId?: string;
  rect: Rect;
  role: string;
  scope: NativeElementScope;
  selected: SupportedValue<boolean>;
  text?: string;
  value?: string;
  visible: SupportedValue<boolean>;
  windowId: string;
};

export type NativeSelector = {
  strategy: '-furn:text' | 'accessibility id' | 'link text' | 'partial link text' | 'tag name';
  value: string;
};

export type NativeSearchRoot = {
  elementId?: string;
  windowId: string;
};

export type NativeImage = {
  data: Uint8Array;
  height: number;
  mimeType: 'image/png';
  scaleFactor: number;
  width: number;
};

export type NativeActionOrigin = 'pointer' | 'viewport' | { elementId: string };
export type NativeAction = WebDriverAction & {
  origin?: NativeActionOrigin;
};
export type NativeActionSequence = Omit<WebDriverActionSequence, 'actions'> & {
  actions: NativeAction[];
};

export type DesktopTreeNode = {
  children: readonly DesktopTreeNode[];
  name?: string;
  rect: Rect;
  role: string;
  states: {
    checked?: boolean | 'mixed';
    enabled?: boolean;
    expanded?: boolean;
    focused?: boolean;
    selected?: boolean;
    visible?: boolean;
  };
  testId?: string;
  text?: string;
  value?: string;
};

export type DesktopTarget = {
  endpoint: DesktopEndpoint;
  host: DesktopHost;
  id: string;
  platformName: DesktopPlatformName;
  renderer: DesktopRenderer;
  storyRootTestId?: string;
  storyOrchestrator?: StoryOrchestrator;
};

export type DesktopHostEvent =
  | { type: 'application-exited'; applicationId: string }
  | { type: 'structure-changed'; windowId: string }
  | { type: 'window-closed'; windowId: string }
  | { type: 'window-opened'; windowId: string };

export interface DesktopHost {
  readonly endpoint: DesktopEndpoint;

  probe(signal?: AbortSignal): Promise<DesktopHostInfo>;
  launch(target: DesktopTarget, signal?: AbortSignal): Promise<ApplicationLease>;
  attach(target: DesktopTarget, signal?: AbortSignal): Promise<ApplicationLease>;
  closeApplication(lease: ApplicationLease, signal?: AbortSignal): Promise<void>;

  windows(lease: ApplicationLease, signal?: AbortSignal): Promise<DesktopWindow[]>;
  closeWindow(windowId: string, signal?: AbortSignal): Promise<void>;
  activate(windowId: string, signal?: AbortSignal): Promise<void>;
  getWindowRect(windowId: string, signal?: AbortSignal): Promise<Rect>;
  setWindowRect(windowId: string, rect: Partial<Rect>, signal?: AbortSignal): Promise<Rect>;

  find(root: NativeSearchRoot, selector: NativeSelector, signal?: AbortSignal): Promise<NativeElementSnapshot[]>;
  snapshot(elementId: string, signal?: AbortSignal): Promise<NativeElementSnapshot>;
  activeElement(windowId: string, signal?: AbortSignal): Promise<NativeElementSnapshot | null>;
  hitTest(windowId: string, x: number, y: number, signal?: AbortSignal): Promise<NativeElementSnapshot | null>;

  click(elementId: string, mode: DesktopClickMode, signal?: AbortSignal): Promise<void>;
  focus(elementId: string, signal?: AbortSignal): Promise<void>;
  clear(elementId: string, signal?: AbortSignal): Promise<void>;
  sendKeys(elementId: string, text: string, signal?: AbortSignal): Promise<void>;
  performActions(actions: readonly NativeActionSequence[], signal?: AbortSignal): Promise<void>;
  releaseActions(signal?: AbortSignal): Promise<void>;

  captureWindow(windowId: string, signal?: AbortSignal): Promise<NativeImage>;
  captureElement(elementId: string, signal?: AbortSignal): Promise<NativeImage>;
  source(windowId: string, signal?: AbortSignal): Promise<string>;
  tree(windowId: string, signal?: AbortSignal): Promise<NativeElementSnapshot[]>;

  subscribe?(listener: (event: DesktopHostEvent) => void): () => void;
  dispose(signal?: AbortSignal): Promise<void>;
}
