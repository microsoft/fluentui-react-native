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

/** How a host clears a value: by setting it through the accessibility tree, or by selecting and deleting with keys. */
export type DesktopClearMechanism = 'keyboard' | 'semantic';

export type DesktopHostFeatures = {
  /** The host lists an element's accessibility actions, including authored custom actions such as `Select` and `Toggle`. */
  accessibilityActions?: boolean;
  accessibilityClick: boolean;
  /** The host samples a window's tree within explicit budgets (`observe`) and drops element records (`releaseElements`). */
  boundedObservation?: boolean;
  elementScreenshot: boolean;
  focus: boolean;
  keyboard: boolean;
  /**
   * The host performs one listed accessibility action by its key (`listAccessibilityActions` and
   * `performAccessibilityAction`). Requires `accessibilityActions`.
   */
  performAccessibilityAction?: boolean;
  physicalClick: boolean;
  screenshot: boolean;
  setWindowRect: boolean;
  /**
   * The host clears with the mechanism it is asked for: `semantic` only sets the value through the accessibility tree,
   * `keyboard` only selects and deletes with synthesized keys, and either fails without falling back to the other.
   */
  strictClear?: boolean;
  wheel: boolean;
  /** The host records a native window-event timeline for diagnostics. */
  windowEvents?: boolean;
};

/** One recorded native window notification; `ageMs` is relative to when the log was read. */
export type DesktopWindowEvent = {
  ageMs: number;
  element: string;
  notification: string;
  sequence: number;
  windowId?: string;
};

/** A bounded, advisory window-event timeline and the current native window publication. */
export type DesktopWindowEventLog = {
  /** Recent helper commands on the same clock as `events`, when the host journals them. */
  commands?: { ageMs: number; command: string; detail?: Record<string, unknown>; durationMs?: number; outcome: string; sequence: number }[];
  events: DesktopWindowEvent[];
  eventsTruncated: boolean;
  observing: boolean;
  publication?: Record<string, unknown>;
  registrationFailures?: string[];
  source: string;
  trackedWindows?: { closed: boolean; element: string; id: string; primary: boolean; title: string }[];
};

/**
 * One action an element publishes. `key` is opaque: it binds the exact native action, such as a custom action's target,
 * without revealing it, and stays meaningful only to the host that issued it.
 */
export type NativeAccessibilityAction = {
  key: string;
  name: string;
};

export type DesktopHostInfo = {
  endpoint: DesktopEndpoint;
  features: DesktopHostFeatures;
  platformName: DesktopPlatformName;
  protocolVersion: 1;
};

export type ApplicationLease = {
  /**
   * How far the provider's ownership reaches, when it reports it: `job-object` contains an unpackaged Windows launch
   * and its descendants, `uncontained` owns only the identity-verified process whose window it leased, and `external`
   * is an attached application the provider never ends. Absent from providers that make no containment claim.
   */
  containment?: 'external' | 'job-object' | 'uncontained';
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
  helpText?: SupportedValue<string>;
  name?: string;
  parentId?: string;
  rect: Rect;
  required?: SupportedValue<boolean>;
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

/** Facts a bounded observation can add to its base node fields; the closed set is part of FDR1 (`native/PROTOCOL.md`). */
export type NativeObserveFact =
  | 'actions'
  | 'checked'
  | 'enabled'
  | 'expanded'
  | 'focused'
  | 'geometry'
  | 'help'
  | 'required'
  | 'selected'
  | 'text'
  | 'value'
  | 'visible';

/** Every field is required and range-checked by the provider; see the budget table in `native/PROTOCOL.md`. */
export type NativeObserveBudget = {
  deadlineMs: number;
  maxBytes: number;
  maxDepth: number;
  maxStringLength: number;
  maxVisited: number;
};

export type NativeObserveRequest = {
  budget: NativeObserveBudget;
  facts: readonly NativeObserveFact[];
  /** Element id that roots the sample; the window root when omitted. */
  rootId?: string;
  windowId: string;
};

/** What a sample knows about a node's children. `unknown` means they were not read, so the node is not a leaf. */
export type NativeChildrenState = 'complete' | 'none' | 'truncated' | 'unknown';

/** Base fields are always present; fact fields appear only when requested, so absence means unobserved. */
export type NativeObservedNode = {
  actions?: string[];
  automationId?: string;
  checked?: SupportedValue<boolean | 'mixed'>;
  childCount?: number;
  childrenState: NativeChildrenState;
  /** Fields whose string was cut to the budget's `maxStringLength`. */
  clipped?: string[];
  depth: number;
  enabled?: SupportedValue<boolean>;
  expanded?: SupportedValue<boolean>;
  focused?: SupportedValue<boolean>;
  helpText?: SupportedValue<string>;
  id: string;
  name?: string;
  parentId?: string;
  rect?: Rect;
  required?: SupportedValue<boolean>;
  role: string;
  scope: NativeElementScope;
  selected?: SupportedValue<boolean>;
  text?: string;
  value?: string;
  visible?: SupportedValue<boolean>;
};

export type NativeObserveTruncationReason = 'bytes' | 'deadline' | 'depth' | 'references' | 'unreadable' | 'visited';

export type NativeObserveTruncation = {
  /** The budget that applied, for the reasons that have one. */
  limit?: number;
  reason: NativeObserveTruncationReason;
  /** A lower bound on elements known to exist but not visited. */
  unvisited?: number;
};

/** One bounded, ordered sample; `complete` is true only when no limit stopped the walk. */
export type NativeObservation = {
  complete: boolean;
  elapsedMs: number;
  nodes: NativeObservedNode[];
  truncation: NativeObserveTruncation[];
  unsupportedFacts: NativeObserveFact[];
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
    required?: boolean;
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
  renderer?: DesktopRenderer;
  launchModes?: readonly ('attach' | 'launch')[];
  launchTimeoutMs?: number;
  storyRootTestId?: string;
  storyOrchestrator?: StoryOrchestrator;
};

export type DesktopHostEvent =
  | { type: 'application-exited'; applicationId: string }
  | { type: 'structure-changed'; windowId: string }
  | { type: 'window-closed'; windowId: string }
  | { type: 'window-opened'; windowId: string };

/**
 * A host that mutates an application (`activate`, `clear`, `click`, `closeWindow`, `performActions`, `releaseActions`,
 * `sendKeys`, `setWindowRect`) must attach the effect of a failed or cancelled call with `attachFailureEffect` from
 * `protocol/settlement`. An unannotated failure is `unknown` and quarantines the target; only `none` leaves it usable,
 * so a host that cannot tell whether a dispatched mutation landed must not claim `none`.
 */
export interface DesktopHost {
  readonly endpoint: DesktopEndpoint;

  probe(signal?: AbortSignal): Promise<DesktopHostInfo>;
  launch(target: DesktopTarget, signal?: AbortSignal): Promise<ApplicationLease>;
  attach(target: DesktopTarget, signal?: AbortSignal): Promise<ApplicationLease>;
  /**
   * Closes the application a lease names; an attached application is left running. Resolving does not promise that the
   * process has exited, so the service never takes it as proof: it lifts a launched application's quarantine only when
   * the operator's `probeApplication` reports the exact incarnation `exited`. A host that could not close the
   * application should fail rather than resolve.
   */
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
  /**
   * Clears an element's value. Without a mechanism the host chooses, preferring a semantic clear; with one, a host that
   * advertises `features.strictClear` uses only that mechanism. Resolves with the mechanism used, or nothing when the host
   * cannot say, which counts as possible keyboard input.
   */
  clear(elementId: string, signal?: AbortSignal, mechanism?: DesktopClearMechanism): Promise<DesktopClearMechanism | void>;
  sendKeys(elementId: string, text: string, signal?: AbortSignal): Promise<void>;
  performActions(actions: readonly NativeActionSequence[], signal?: AbortSignal): Promise<void>;
  releaseActions(signal?: AbortSignal): Promise<void>;

  captureWindow(windowId: string, signal?: AbortSignal): Promise<NativeImage>;
  captureElement(elementId: string, signal?: AbortSignal): Promise<NativeImage>;
  source(windowId: string, signal?: AbortSignal): Promise<string>;
  tree(windowId: string, signal?: AbortSignal): Promise<NativeElementSnapshot[]>;
  windowEvents?(lease: ApplicationLease, signal?: AbortSignal): Promise<DesktopWindowEventLog>;
  /**
   * Lists the names of the actions the native accessibility tree publishes for an element, in provider order. Custom
   * action names are returned as authored and never include provider handles. Present only when the host advertises
   * `features.accessibilityActions`.
   */
  accessibilityActions?(elementId: string, signal?: AbortSignal): Promise<string[]>;
  /**
   * Lists an element's published actions with the keys `performAccessibilityAction` takes. Read-only. Present only when
   * the host advertises `features.performAccessibilityAction`.
   */
  listAccessibilityActions?(elementId: string, signal?: AbortSignal): Promise<NativeAccessibilityAction[]>;
  /**
   * Performs the one published action whose key matches, a mutation that settles like `click`. An action that changed
   * since it was listed is refused as `element not interactable` with the reason `action-changed`. Present only with
   * `features.performAccessibilityAction`.
   */
  performAccessibilityAction?(elementId: string, key: string, signal?: AbortSignal): Promise<void>;

  /**
   * Samples a window's tree within explicit budgets without failing on large trees. Read-only: it never carries an
   * effect. Present only when the host advertises `features.boundedObservation`; Node never substitutes `tree` for it.
   */
  observe?(request: NativeObserveRequest, signal?: AbortSignal): Promise<NativeObservation>;
  /**
   * Drops the host's records for element ids Node no longer needs and returns how many were dropped. Unknown ids are
   * ignored, and a released id is rejected as stale afterwards. Present only with `features.boundedObservation`.
   */
  releaseElements?(elementIds: readonly string[], signal?: AbortSignal): Promise<number>;

  subscribe?(listener: (event: DesktopHostEvent) => void): () => void;
  dispose(signal?: AbortSignal): Promise<void>;
}
