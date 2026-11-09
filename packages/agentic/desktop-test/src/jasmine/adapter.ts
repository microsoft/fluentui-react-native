import {
  compareDesktopInputReceipts,
  decideDesktopCase,
  describeUndeclaredDesktopInput,
  mergeDesktopCaseOptions,
  resolveDesktopClickMode,
  subtractDesktopInputReceipts,
  validateDesktopCaseOptions,
  validateDesktopGroupOptions,
} from '@fluentui-react-native/desktop-driver/authoring';
import type { DesktopCaseOptions, DesktopInputReceipts, ResolvedDesktopCaseOptions } from '@fluentui-react-native/desktop-driver/authoring';
import { desktopSpecIdentifier } from './registry.js';
import type { DesktopJasmineRegistry, DesktopSpecEntry } from './registry.js';

/** WDIO calls a spec body without Jasmine's `done`, so a body finishes by returning, or by settling the promise it returns. */
export type DesktopSpecBody = (done: (error?: unknown) => void) => unknown;
export type DesktopGroupBody = (this: unknown) => void;
/** A group scopes the cases inside it. A gap describes one case, so a group cannot declare one. */
export type DesktopGroupOptions = Omit<DesktopCaseOptions, 'unsupported' | 'quarantine'>;

/** The part of the Jasmine globals the adapter registers specs through. */
export type DesktopJasmineApi = {
  describe(name: string, body: DesktopGroupBody): unknown;
  it(name: string, body: DesktopSpecBody): unknown;
  xit(name: string): unknown;
};

/** Reads the receipts of the session the specs drive, or nothing when the session cannot report them. */
export type DesktopInputReader = () => Promise<DesktopInputReceipts | undefined>;

type RunEntry = Extract<DesktopSpecEntry, { kind: 'run' }>;

/**
 * Declares tests with their input modality and the places they run, and registers them with Jasmine.
 *
 * `desktopIt` and `desktopDescribe` never throw for a bad declaration: Jasmine only warns when a spec file fails to load,
 * so a throw would silently drop every test after it. A bad declaration becomes a failing spec that reports the problem.
 *
 * With `readInput`, each executed body is attributed: the input its session delivered while the body ran is compared with
 * the declaration, and a mechanism nothing declares fails the test.
 */
export function createDesktopJasmine(api: DesktopJasmineApi, registry: DesktopJasmineRegistry, readInput?: DesktopInputReader) {
  function record(spec: unknown, name: string, entry: DesktopSpecEntry): void {
    const identifier = desktopSpecIdentifier(spec as { description?: unknown; id?: unknown } | undefined);
    if (identifier === undefined) {
      registry.errors.push(`Jasmine did not identify the spec registered for "${name}", so its selection cannot be verified.`);
      return;
    }
    registry.entries.set(identifier, entry);
  }

  function failing(name: string, error: unknown): void {
    record(
      api.it(name, () => {
        throw error;
      }),
      name,
      { kind: 'invalid' },
    );
  }

  function attributed(body: DesktopSpecBody, entry: RunEntry, read: DesktopInputReader): DesktopSpecBody {
    return async function (this: unknown, ...args: unknown[]) {
      delete entry.input;
      const before = await read();
      if (!before) return body.apply(this, args as Parameters<DesktopSpecBody>);
      let failure: { error: unknown } | undefined;
      try {
        await body.apply(this, args as Parameters<DesktopSpecBody>);
      } catch (error) {
        failure = { error };
      }
      try {
        const after = await read();
        if (after) {
          const receipts = subtractDesktopInputReceipts(after, before);
          // The session's click mode is the lane's, so a click the host chose is judged the way it was delivered.
          const clickMode = resolveDesktopClickMode(undefined, 'auto', registry.selection?.lane);
          const { undeclared, unused } = compareDesktopInputReceipts(entry.descriptor, receipts, clickMode);
          entry.input = { receipts, ...(undeclared.length ? { undeclared } : {}), ...(!failure && unused.length ? { unused } : {}) };
        }
      } catch (error) {
        // A failed test keeps its own error; the receipts were only evidence for it.
        if (!failure) throw error;
      }
      if (failure) throw failure.error;
      if (entry.input?.undeclared) throw new Error(describeUndeclaredDesktopInput(entry.input.undeclared));
    };
  }

  function desktopIt(name: string, optionsOrBody: DesktopCaseOptions | DesktopSpecBody, maybeBody?: DesktopSpecBody): void {
    const hasOptions = typeof optionsOrBody !== 'function';
    const body = hasOptions ? maybeBody : optionsOrBody;
    const title = typeof name === 'string' && name.trim() ? name : 'desktopIt';
    const source = `desktopIt("${title}")`;
    let descriptor: ResolvedDesktopCaseOptions;
    let decision: ReturnType<typeof decideDesktopCase>;
    try {
      if (title !== name) throw new TypeError('desktopIt requires a non-empty name.');
      if (typeof body !== 'function') throw new TypeError(`${source} requires a test function.`);
      const declared = validateDesktopCaseOptions(hasOptions ? optionsOrBody : {}, `${source} options`);
      descriptor = mergeDesktopCaseOptions(registry.groups.at(-1), declared, source);
      decision = registry.selection ? decideDesktopCase(descriptor, registry.selection, source) : { kind: 'run' };
    } catch (error) {
      failing(title, error);
      return;
    }
    if (decision.kind === 'run') {
      const entry: RunEntry = { kind: 'run', descriptor };
      record(api.it(name, readInput ? attributed(body, entry, readInput) : body), name, entry);
      return;
    }
    // A placeholder keeps the spec out of Jasmine's hooks and body without reporting it as a skipped test.
    const entry: DesktopSpecEntry =
      decision.kind === 'excluded' ? { kind: 'excluded', reason: decision.reason } : { kind: 'gap', gap: decision.gap };
    record(api.xit(name), name, entry);
  }

  function desktopDescribe(name: string, optionsOrBody: DesktopGroupOptions | DesktopGroupBody, maybeBody?: DesktopGroupBody): void {
    const hasOptions = typeof optionsOrBody !== 'function';
    const body = hasOptions ? maybeBody : optionsOrBody;
    const title = typeof name === 'string' && name.trim() ? name : 'desktopDescribe';
    const source = `desktopDescribe("${title}")`;
    let group: ResolvedDesktopCaseOptions;
    try {
      if (title !== name) throw new TypeError('desktopDescribe requires a non-empty name.');
      if (typeof body !== 'function') throw new TypeError(`${source} requires a body.`);
      const declared = validateDesktopGroupOptions(hasOptions ? optionsOrBody : {}, `${source} options`);
      group = mergeDesktopCaseOptions(registry.groups.at(-1), declared, source);
    } catch (error) {
      // The body does not run, so nothing inside an unreadable group is selected by accident.
      api.describe(title, () => failing('has invalid desktop options', error));
      return;
    }
    api.describe(name, function (this: unknown) {
      registry.groups.push(group);
      try {
        body.call(this);
      } finally {
        registry.groups.pop();
      }
    });
  }

  return { desktopIt, desktopDescribe };
}
