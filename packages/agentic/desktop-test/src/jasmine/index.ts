import { createDesktopJasmine } from './adapter.js';
import type { DesktopGroupBody, DesktopGroupOptions, DesktopInputReader, DesktopJasmineApi, DesktopSpecBody } from './adapter.js';
import { desktopJasmineRegistry } from './registry.js';
import type { DesktopCaseOptions, DesktopSessionInput } from '@fluentui-react-native/desktop-driver/authoring';

export type {
  DesktopCaseOptions,
  DesktopInput,
  DesktopPlatforms,
  DesktopRequirement,
} from '@fluentui-react-native/desktop-driver/authoring';
export type { DesktopGroupBody, DesktopGroupOptions, DesktopSpecBody } from './adapter.js';

// The Jasmine globals exist only once a framework has installed them, so they are read when a declaration runs.
const globals = () => globalThis as unknown as DesktopJasmineApi;
const jasmineApi: DesktopJasmineApi = {
  describe: (name, body) => globals().describe(name, body),
  it: (name, body) => globals().it(name, body),
  xit: (name) => globals().xit(name),
};
// The desktop commands are installed on the session before any spec runs, so a body is attributed whenever they exist.
const readInput: DesktopInputReader = async () => {
  const browser = (globalThis as { browser?: { desktopInput?: () => Promise<DesktopSessionInput> } }).browser;
  return browser?.desktopInput ? (await browser.desktopInput()).receipts : undefined;
};
const adapter = () => createDesktopJasmine(jasmineApi, desktopJasmineRegistry(), readInput);

/**
 * Declares a Jasmine test with the input it needs and where it runs. The descriptor decides whether the test is part of a
 * run: `requires` implies the input modality, `platforms` and `scope` narrow where it runs, and `unsupported` or
 * `quarantine` report a known gap instead of executing.
 */
export function desktopIt(name: string, body: DesktopSpecBody): void;
export function desktopIt(name: string, options: DesktopCaseOptions, body: DesktopSpecBody): void;
export function desktopIt(name: string, optionsOrBody: DesktopCaseOptions | DesktopSpecBody, maybeBody?: DesktopSpecBody): void {
  adapter().desktopIt(name, optionsOrBody, maybeBody);
}

/**
 * Declares a Jasmine group whose options apply to every test inside it: requirements add up, platforms and scope intersect,
 * and a nested declaration can only narrow its group.
 */
export function desktopDescribe(name: string, body: DesktopGroupBody): void;
export function desktopDescribe(name: string, options: DesktopGroupOptions, body: DesktopGroupBody): void;
export function desktopDescribe(name: string, optionsOrBody: DesktopGroupOptions | DesktopGroupBody, maybeBody?: DesktopGroupBody): void {
  adapter().desktopDescribe(name, optionsOrBody, maybeBody);
}
