import type { DesktopEndpoint } from '@fluentui-react-native/desktop-driver';
import { desktopInputLanes, resolveDesktopScopeDomains, resolveDesktopScopeValues } from '@fluentui-react-native/desktop-driver/authoring';
import type { DesktopCaseTarget, DesktopInputLane } from '@fluentui-react-native/desktop-driver/authoring';

/** Carries a run's selection from its launcher to its WDIO workers. The value is data that is parsed, never evaluated. */
export const desktopTestSelectionEnvironment = 'DESKTOP_TEST_SELECTION';

/** What a worker judges each declared case against. */
export type DesktopTestSelection = Omit<DesktopCaseTarget, 'now'>;

/** The serialized selection: the custom scope domains and the target's values, which a worker validates again. */
export type DesktopTestSelectionRequest = {
  endpoint: DesktopEndpoint;
  lane?: DesktopInputLane;
  testScopes?: unknown;
  values: Readonly<Record<string, string>>;
};

const endpoints: readonly string[] = ['macos', 'windows', 'win32'];

export function serializeDesktopTestSelection(request: DesktopTestSelectionRequest): string {
  const { endpoint, lane, testScopes, values } = request;
  return JSON.stringify({ endpoint, ...(lane ? { lane } : {}), ...(testScopes ? { testScopes } : {}), values });
}

/** Validates the selection a launcher sent. A malformed one is an error, so a worker never guesses what to run. */
export function parseDesktopTestSelection(raw: string): DesktopTestSelection {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new TypeError(`${desktopTestSelectionEnvironment} is not valid JSON.`);
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`${desktopTestSelectionEnvironment} must be an object.`);
  }
  const selection = value as Record<string, unknown>;
  const unknown = Object.keys(selection).find((key) => !['endpoint', 'lane', 'testScopes', 'values'].includes(key));
  if (unknown !== undefined) throw new TypeError(`${desktopTestSelectionEnvironment} has unknown key "${unknown}".`);
  if (typeof selection.endpoint !== 'string' || !endpoints.includes(selection.endpoint)) {
    throw new TypeError(`${desktopTestSelectionEnvironment}.endpoint must be one of: ${endpoints.join(', ')}.`);
  }
  if (selection.lane !== undefined && !desktopInputLanes.some((lane) => lane === selection.lane)) {
    throw new TypeError(`${desktopTestSelectionEnvironment}.lane must be one of: ${desktopInputLanes.join(', ')}.`);
  }
  const domains = resolveDesktopScopeDomains(selection.testScopes, `${desktopTestSelectionEnvironment}.testScopes`);
  return {
    endpoint: selection.endpoint as DesktopEndpoint,
    ...(selection.lane ? { lane: selection.lane as DesktopInputLane } : {}),
    domains,
    values: resolveDesktopScopeValues(selection.values ?? {}, domains, `${desktopTestSelectionEnvironment}.values`),
  };
}

/** The selection of this process, or undefined when no desktop-test run started it. */
export function desktopTestSelectionFromEnvironment(environment: NodeJS.ProcessEnv = process.env): DesktopTestSelection | undefined {
  const raw = environment[desktopTestSelectionEnvironment];
  return raw === undefined ? undefined : parseDesktopTestSelection(raw);
}
