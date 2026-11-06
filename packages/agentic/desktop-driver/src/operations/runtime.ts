import type { z } from 'zod';

import type {
  DesktopHostEvent,
  NativeAccessibilityAction,
  NativeElementSnapshot,
  NativeImage,
  NativeObservation,
  NativeObserveRequest,
} from '../host/types.js';
import type { JournalScalar } from './journal.js';
import type { OperationSessionState } from './sessionState.js';

/** The slice of a desktop host an operation uses. The server builds it from the session's host. */
export type OperationHost = {
  activate(windowId: string, signal: AbortSignal): Promise<void>;
  captureElement(nativeId: string, signal: AbortSignal): Promise<NativeImage>;
  captureWindow(windowId: string, signal: AbortSignal): Promise<NativeImage>;
  clear(nativeId: string, signal: AbortSignal): Promise<void>;
  click(nativeId: string, mode: 'accessibility' | 'physical', signal: AbortSignal): Promise<void>;
  hitTest(windowId: string, x: number, y: number, signal: AbortSignal): Promise<NativeElementSnapshot | null>;
  /** The element's published actions with their keys. Called only when `capabilities.accessibilityActions` is true. */
  listAccessibilityActions(nativeId: string, signal: AbortSignal): Promise<NativeAccessibilityAction[]>;
  observe(request: NativeObserveRequest, signal: AbortSignal): Promise<NativeObservation>;
  /** Performs the listed action whose key matches. Called only when `capabilities.accessibilityActions` is true. */
  performAccessibilityAction(nativeId: string, key: string, signal: AbortSignal): Promise<void>;
  releaseElements(nativeIds: readonly string[], signal: AbortSignal): Promise<number>;
  sendKeys(nativeId: string, text: string, signal: AbortSignal): Promise<void>;
  snapshot(nativeId: string, signal: AbortSignal): Promise<NativeElementSnapshot>;
  /** Advisory host events, which may wake a wait early but never satisfy it. Absent when the host publishes none. */
  subscribe?(listener: (event: DesktopHostEvent) => void): () => void;
};

/**
 * Whether operations may read what applications display. Element names and automation ids identify controls and are
 * always readable; `deny` withholds the content an application shows: values, text, and help.
 */
export type ContentPolicy = 'allow' | 'deny';

/** What the session's provider supports, which decides which operations are available. */
export type OperationCapabilities = {
  /** Semantic activation through the accessibility tree, such as AXPress or a UIA pattern. */
  readonly accessibilityClick: boolean;
  /** Performing one named accessibility action an element publishes, such as a custom `Toggle` or `AXShowMenu`. */
  readonly accessibilityActions: boolean;
  readonly boundedObservation: boolean;
  readonly elementCapture: boolean;
  readonly keyboard: boolean;
  /** A synthesized pointer click at the element's hit-tested centre. */
  readonly physicalClick: boolean;
  /** The target renders Storybook stories the session can list and select. */
  readonly stories: boolean;
  readonly windowCapture: boolean;
};

/**
 * How the session knows which story is rendered. `marker`: the native story root confirmed it. `unconfirmed`: the root
 * could not be read in the current window. `none`: the target has no native story root.
 */
export type StoryVerification = 'marker' | 'none' | 'unconfirmed';

/** The story this session selected, as revalidated when it was read. */
export type OperationCurrentStory = {
  /** The rendered story is not the one this session selected, so the session forgot it and expired the preview. */
  changed?: true;
  /** Absent when no story is selected. */
  story?: { storyId: string; verification: StoryVerification };
};

/** The session's Storybook catalog and selection. Present only when `capabilities.stories` is true. */
export type OperationStories = {
  /** The target's story catalog. */
  catalog(signal: AbortSignal): Promise<readonly OperationStoryEntry[]>;
  /** The selected story, checked against the rendered story root so a change made by another client is noticed. */
  current(signal: AbortSignal): Promise<OperationCurrentStory>;
  /**
   * Selects or resets a story and waits until it renders. The preview region expires before anything is dispatched,
   * and the call runs to settlement once dispatched. A failure leaves no story selected.
   */
  change(action: 'reset' | 'select', storyId: string): Promise<{ storyId: string; verification: 'marker' | 'none' }>;
};

export type OperationStoryEntry = {
  id: string;
  name: string;
  tags: readonly string[];
  title: string;
};

/**
 * Everything an operation may touch for one request. Operations depend on this interface rather than on the server, so
 * they run unchanged under HTTP today and under an MCP adapter later, and a test can supply a plain object.
 */
export type OperationRuntime = {
  readonly capabilities: OperationCapabilities;
  readonly contentPolicy: ContentPolicy;
  readonly host: OperationHost;
  readonly state: OperationSessionState;
  /** Runs host work for this request: it ends at the native command timeout or when the caller leaves. */
  command<T>(description: string, run: (signal: AbortSignal) => Promise<T>): Promise<T>;
  /**
   * Runs host work that keeps the session correct, such as releasing records, so it still runs when the caller has
   * left. It ends at the native command timeout.
   */
  cleanup<T>(description: string, run: (signal: AbortSignal) => Promise<T>): Promise<T>;
  currentWindowId(): string | undefined;
  /** The native command timeout, which every provider deadline must fit inside. */
  nativeTimeoutMs(): number;
  /** The generation of the replaceable preview region; elements in it expire when it changes. */
  previewGeneration(): number;
  /** True while the session's target refuses mutations. Reads stay allowed. */
  quarantined(): boolean;
  /**
   * Runs `run` in the target-wide physical input turn, so no other session's input interleaves with it. Reads that
   * revalidate an element run inside the turn, immediately before the mutation they guard.
   */
  input<T>(run: () => Promise<T>): Promise<T>;
  /**
   * Runs one mutating host command behind the target quarantine guard and settles its failure into a disposition. The
   * command runs to settlement once dispatched: leaving the request does not abort it, because an aborted dispatch is
   * indeterminate and quarantines the target. `description` is recorded with any quarantine, so it names the command
   * and the reference, never typed or displayed text.
   */
  mutate<T>(description: string, run: (signal: AbortSignal) => Promise<T>): Promise<T>;
  /** Aborts when the caller leaves. Operations check it before dispatching, never after. */
  readonly signal: AbortSignal;
  /** Present when `capabilities.stories` is true. */
  readonly stories?: OperationStories;
};

export type OperationAvailability = { available: true } | { available: false; reason: string };

export type OperationEffect = 'mutate' | 'read';

/**
 * One operation an agent can call. `Input` is what `run` receives after validation, so schema defaults are already
 * applied; `Output` is what it returns. The schemas are the contract: the catalog is generated from them and tests
 * parse real results against them.
 */
export type OperationDefinition<Input, Output> = {
  availability(capabilities: OperationCapabilities): OperationAvailability;
  readonly effect: OperationEffect;
  readonly input: z.ZodType<Input>;
  /** False for an operation that reads the journal, so reading it does not fill it. */
  readonly journaled?: boolean;
  readonly name: string;
  readonly output: z.ZodType<Output>;
  run(input: Input, runtime: OperationRuntime): Promise<Output>;
  /**
   * The scalar fields the journal may keep. `output` is absent when the operation failed. Never include anything an
   * application displayed or a caller typed.
   */
  summarize(input: Input, output: Output | undefined): Readonly<Record<string, JournalScalar>>;
  readonly summary: string;
};

/** An operation with its types erased, as the executor and catalog hold it. */
export type RegisteredOperation = OperationDefinition<unknown, unknown>;

/** Erases an operation's types for registration. The executor validates input before calling `run`. */
export function registerOperation<Input, Output>(definition: OperationDefinition<Input, Output>): RegisteredOperation {
  return definition as unknown as RegisteredOperation;
}
