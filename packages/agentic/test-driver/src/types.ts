/**
 * Shared type contracts for the desktop driver.
 *
 * This module is intentionally type-only: it is imported by the neutral core, the WebdriverIO
 * integration, the Storybook integration, and the CLI, and must never pull runtime code into any
 * of them.
 */

/** Platform a shared spec can run against. `fake` is the in-process contract endpoint. */
export type DesktopPlatform = 'macos' | 'windows' | 'fake';

/** Concrete backend implementation hosted by the single-driver host. */
export type DesktopBackendId = 'mac2' | 'windows' | 'novawindows' | 'fake';

/**
 * How a session obtains the application under test.
 *
 * Only `launch` grants the driver permission to terminate the application. `attach` never
 * terminates anything it did not start, which is what keeps an interactive Storybook app running
 * after a "Run current test" action.
 */
export type DesktopAppTarget =
  | {
      mode: 'launch';
      /** Executable path, `.app` bundle path, bundle identifier, or UWP application id. */
      app: string;
      args?: readonly string[];
      workingDirectory?: string;
      environment?: Readonly<Record<string, string>>;
    }
  | {
      mode: 'attach';
      /** Bundle identifier (macOS) or package/executable identity (Windows). */
      identity?: string;
      processId?: number;
      /** Native top-level window handle, as reported by the platform backend. */
      windowHandle?: string;
      title?: string;
    };

/** Observable application states. See the lifecycle state machine in `lifecycle.ts`. */
export type DesktopAppState =
  | 'created'
  | 'starting'
  | 'attaching'
  | 'connected'
  | 'ready'
  | 'stopping'
  | 'stopped'
  | 'exited'
  | 'crashed'
  | 'timed_out';

/** Normalized lifecycle event names emitted by every execution surface. */
export type DesktopLifecycleEventType =
  | 'launchRequested'
  | 'driverHostStarted'
  | 'processStarted'
  | 'windowDiscovered'
  | 'webDriverSessionCreated'
  | 'ready'
  | 'exitObserved'
  | 'crashObserved'
  | 'shutdownRequested'
  | 'shutdownCompleted'
  | 'monitorError';

/** Why an application stopped running. */
export type DesktopExitReason = 'normalExit' | 'requestedShutdown' | 'crashed' | 'lostProcess' | 'monitorFailure';

/** Which party owns a tracked resource. Only `self` resources may be terminated. */
export type DesktopOwnership = 'self' | 'external';

/** A resource recorded in the ownership manifest. */
export interface DesktopOwnedResource {
  kind: 'driverHost' | 'nativeDriver' | 'app' | 'window' | 'port' | 'session';
  ownership: DesktopOwnership;
  /** Process id, port number, window handle, or session id depending on `kind`. */
  id: string;
  label?: string;
  recordedAt: string;
}

/** A single normalized lifecycle event. Payloads are bounded and redacted before persistence. */
export interface DesktopLifecycleEvent {
  type: DesktopLifecycleEventType;
  timestamp: string;
  platform: DesktopPlatform;
  ownership: DesktopOwnership;
  state: DesktopAppState;
  sessionId?: string;
  processId?: number;
  detail?: Readonly<Record<string, unknown>>;
}

/** Configurable readiness gates applied after a session is created. */
export interface DesktopReadinessOptions {
  /** Require a discovered top-level window before reporting `ready`. Defaults to `true`. */
  requireWindow?: boolean;
  /** Require the Storybook channel to answer before reporting `ready`. Defaults to `false`. */
  requireStorybookChannel?: boolean;
  /** Optional `testID` that must be displayed before reporting `ready`. */
  requireTestId?: string;
  /** Total readiness budget in milliseconds. Defaults to 60000. */
  timeout?: number;
}

/** Storybook channel-server connection used by the story controller. */
export interface DesktopStorybookOptions {
  host?: string;
  port?: number;
  /** How long to wait for a `storyRendered` acknowledgement. Defaults to 30000. */
  renderTimeout?: number;
  /** Directory roots that a colocated story spec path is allowed to resolve into. */
  specRoots?: readonly string[];
}

/** Portable, user-facing desktop driver configuration. */
export interface DesktopDriverOptions {
  platform: DesktopPlatform;
  /** Overrides the default backend for `platform`. */
  backend?: DesktopBackendId;
  target: DesktopAppTarget;
  /** Loopback interface for the driver host. Only `127.0.0.1` and `::1` are accepted. */
  host?: string;
  /** Fixed driver-host port. `0` (the default) allocates a free port. */
  port?: number;
  /** Driver-host startup budget in milliseconds. Defaults to 120000. */
  startupTimeout?: number;
  readiness?: DesktopReadinessOptions;
  storybook?: DesktopStorybookOptions;
  artifactsDirectory?: string;
  /**
   * Escape hatch for backend-specific W3C capabilities. Values are merged after the generated
   * capabilities, so a consumer can override a mapping the package gets wrong.
   */
  backendCapabilities?: Readonly<Record<string, unknown>>;
  /** Scene document (or path to one) used only by the `fake` backend. */
  fakeScene?: string | DesktopFakeScene;
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';
}

/** Resolved configuration: every optional field is filled in and validated. */
export interface ResolvedDesktopDriverOptions {
  platform: DesktopPlatform;
  backend: DesktopBackendId;
  target: DesktopAppTarget;
  host: string;
  port: number;
  startupTimeout: number;
  readiness: Required<Omit<DesktopReadinessOptions, 'requireTestId'>> & { requireTestId?: string };
  storybook: Required<Omit<DesktopStorybookOptions, 'specRoots'>> & { specRoots: readonly string[] };
  artifactsDirectory: string;
  backendCapabilities: Readonly<Record<string, unknown>>;
  fakeScene?: string | DesktopFakeScene;
  logLevel: NonNullable<DesktopDriverOptions['logLevel']>;
}

/** A command in the versioned portable subset. */
export type PortableCommand =
  | 'findElement'
  | 'findElements'
  | 'isExisting'
  | 'isDisplayed'
  | 'isEnabled'
  | 'isSelected'
  | 'isFocused'
  | 'click'
  | 'clearValue'
  | 'setValue'
  | 'getText'
  | 'getValue'
  | 'scrollIntoView'
  | 'waitForDisplayed'
  | 'waitForExist'
  | 'getPageSource'
  | 'takeScreenshot';

/** Runtime report of what the connected backend supports. */
export interface DesktopSessionInfo {
  protocolVersion: number;
  portableCommandMatrixVersion: number;
  packageVersion: string;
  platform: DesktopPlatform;
  backend: DesktopBackendId;
  sessionId: string;
  target: DesktopAppTarget;
  ownership: DesktopOwnership;
  state: DesktopAppState;
  driverHostUrl: string;
  storybookUrl?: string;
  portableCommands: readonly PortableCommand[];
  /** Platform extension namespaces available through `./macos` or `./windows`. */
  platformExtensions: readonly string[];
}

/** Target of a story-plan step. Only `testID` is portable. */
export interface StoryStepTarget {
  testId: string;
}

/** Property that an `expect` step may assert. */
export type StoryStepProperty = 'text' | 'value' | 'displayed' | 'enabled' | 'selected';

/** One serializable step of an inline story plan. */
export type StoryPlanStep =
  | { action: 'expectVisible'; target: StoryStepTarget; timeout?: number }
  | { action: 'expectHidden'; target: StoryStepTarget; timeout?: number }
  | { action: 'expectEnabled'; target: StoryStepTarget }
  | { action: 'expectDisabled'; target: StoryStepTarget }
  | { action: 'press'; target: StoryStepTarget }
  | { action: 'clearValue'; target: StoryStepTarget }
  | { action: 'setValue'; target: StoryStepTarget; value: string }
  | { action: 'scrollIntoView'; target: StoryStepTarget }
  | { action: 'expect'; target: StoryStepTarget; property: StoryStepProperty; equals: string | boolean }
  | { action: 'wait'; milliseconds: number }
  | { action: 'screenshot'; name: string };

/** An inline plan compiled into a generated host-side WebdriverIO spec. */
export interface InlineStoryPlan {
  kind: 'inline';
  version?: number;
  /** Stable identifier for the generated test. Unique across the manifest. */
  id: string;
  description?: string;
  steps: readonly StoryPlanStep[];
}

/** A link from a story to a colocated WebdriverIO spec containing arbitrary TypeScript. */
export interface SpecStoryPlan {
  kind: 'spec';
  version?: number;
  id: string;
  description?: string;
  /** Path relative to the story module, resolved inside the configured spec roots. */
  spec: string;
}

/** The value accepted by `parameters.desktopTest`. */
export type StoryPlan = InlineStoryPlan | SpecStoryPlan;

/** One executable entry of the generated story-test manifest. */
export interface StoryTestManifestEntry {
  storyId: string;
  title: string;
  name: string;
  /** Stable test tag embedded in the suite title, for example `[story:components-button--default]`. */
  tag: string;
  /** Absolute path of the spec that owns this test. */
  spec: string;
  /** Escaped Mocha grep that selects exactly this story's tests. */
  grep: string;
  plan: StoryPlan;
  /** Absolute path of the story module the plan came from. */
  storyPath: string;
}

/** The generated story-test manifest. */
export interface StoryTestManifest {
  version: number;
  generatedAt: string;
  /** SHA-256 over the normalized entry list; recorded in `run.json` for the portability gate. */
  digest: string;
  entries: readonly StoryTestManifestEntry[];
}

/** Result of one executed test. */
export interface DesktopTestResult {
  testId: string;
  storyId?: string;
  title: string;
  status: 'passed' | 'failed' | 'skipped' | 'infrastructureError';
  durationMs: number;
  error?: { message: string; stack?: string };
  artifacts?: readonly string[];
}

/** Files captured for a run or a single failing test. */
export interface ArtifactManifest {
  runId: string;
  directory: string;
  files: readonly string[];
}

/** Full description of one run, persisted as `run.json`. */
export interface DesktopRunReport {
  protocolVersion: number;
  portableCommandMatrixVersion: number;
  packageVersion: string;
  runId: string;
  startedAt: string;
  finishedAt: string;
  platform: DesktopPlatform;
  backend: DesktopBackendId;
  target: DesktopAppTarget;
  ownership: DesktopOwnership;
  capabilities: readonly PortableCommand[];
  storyIds: readonly string[];
  /** Digest of the shared spec manifest, compared across platform jobs by the portability gate. */
  specDigest?: string;
  results: readonly DesktopTestResult[];
  summary: {
    passed: number;
    failed: number;
    skipped: number;
    infrastructureError: number;
    durationMs: number;
  };
  artifacts: readonly string[];
}

/** Result of one prerequisite probe reported by `desktop-driver doctor`. */
export interface DesktopPrerequisiteStatus {
  id: string;
  description: string;
  /** `unknown` means the probe could not run, never that the prerequisite is satisfied. */
  status: 'ok' | 'missing' | 'unknown';
  detail?: string;
}

/** One element of a `fake` backend scene. */
export interface DesktopFakeElement {
  testId: string;
  role?: string;
  name?: string;
  text?: string;
  value?: string;
  displayed?: boolean;
  enabled?: boolean;
  selected?: boolean;
  focused?: boolean;
  /** Mutations applied to the scene when this element is clicked. */
  onClick?: readonly DesktopFakeMutation[];
}

/** A scene mutation applied by a fake interaction. */
export interface DesktopFakeMutation {
  testId: string;
  set?: Partial<Omit<DesktopFakeElement, 'testId' | 'onClick'>>;
  /**
   * Increments a per-element press counter and formats it into `text`, replacing `{count}`.
   * Lets the fake model repeated-interaction scenarios instead of only one-shot state changes.
   */
  incrementText?: string;
}

/** Deterministic element tree used by the `fake` backend, keyed by story id. */
export interface DesktopFakeScene {
  version?: number;
  stories: Readonly<Record<string, { elements: readonly DesktopFakeElement[] }>>;
}

/** Health payload published by the single-driver host outside the WebDriver route. */
export interface DriverHostHealth {
  status: 'ok';
  protocolVersion: number;
  packageVersion: string;
  backend: DesktopBackendId;
  webDriverUrl: string;
  storybookUrl?: string;
  pid: number;
}

/** Handle returned by `startDesktopDriver` for standalone (non-testrunner) sessions. */
export interface DesktopDriverService {
  /** WebdriverIO `remote()` options pointing at the owned driver host. */
  webdriverOptions: {
    protocol: 'http';
    hostname: string;
    port: number;
    path: string;
    capabilities: Record<string, unknown>;
    logLevel: NonNullable<DesktopDriverOptions['logLevel']>;
  };
  options: ResolvedDesktopDriverOptions;
  health: DriverHostHealth;
  ownedResources: readonly DesktopOwnedResource[];
  stop(): Promise<void>;
}

/** Status of one loopback test-service run. */
export interface DesktopServiceRunStatus {
  runId: string;
  protocolVersion: number;
  state: 'queued' | 'running' | 'passed' | 'failed' | 'cancelled' | 'error';
  requestedStoryIds: readonly string[];
  startedAt?: string;
  finishedAt?: string;
  results: readonly DesktopTestResult[];
  message?: string;
}
