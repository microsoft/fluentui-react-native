import type {
  DesktopClickMode,
  DesktopEndpoint,
  DesktopPlatformName,
  DesktopRenderer,
  WebDriverActionSequence,
} from '../protocol/types.js';
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
  enabled: SupportedValue<boolean>;
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
  strategy: 'accessibility id' | 'link text' | 'partial link text' | 'tag name';
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

  probe(): Promise<DesktopHostInfo>;
  launch(target: DesktopTarget): Promise<ApplicationLease>;
  attach(target: DesktopTarget): Promise<ApplicationLease>;
  closeApplication(lease: ApplicationLease): Promise<void>;

  windows(lease: ApplicationLease): Promise<DesktopWindow[]>;
  closeWindow(windowId: string): Promise<void>;
  activate(windowId: string): Promise<void>;
  getWindowRect(windowId: string): Promise<Rect>;
  setWindowRect(windowId: string, rect: Partial<Rect>): Promise<Rect>;

  find(root: NativeSearchRoot, selector: NativeSelector): Promise<NativeElementSnapshot[]>;
  snapshot(elementId: string): Promise<NativeElementSnapshot>;
  activeElement(windowId: string): Promise<NativeElementSnapshot | null>;
  hitTest(windowId: string, x: number, y: number): Promise<NativeElementSnapshot | null>;

  click(elementId: string, mode: DesktopClickMode): Promise<void>;
  clear(elementId: string): Promise<void>;
  sendKeys(elementId: string, text: string): Promise<void>;
  performActions(actions: readonly WebDriverActionSequence[]): Promise<void>;
  releaseActions(): Promise<void>;

  captureWindow(windowId: string): Promise<NativeImage>;
  captureElement(elementId: string): Promise<NativeImage>;
  source(windowId: string): Promise<string>;

  subscribe?(listener: (event: DesktopHostEvent) => void): () => void;
  dispose(): Promise<void>;
}
