import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { readDriverInstanceInput, resolveCommandInputLane } from './inputLane.js';

describe('command input lane', () => {
  const driverInput = jest.fn((): 'accessible' | 'physical' | undefined => 'physical');
  beforeEach(() => driverInput.mockClear());

  test('has no lane in compatibility mode', () => {
    expect(resolveCommandInputLane({ command: 'test', runsTests: true, driverInput: () => undefined })).toBeUndefined();
    expect(resolveCommandInputLane({ command: 'test', runsTests: true })).toBeUndefined();
  });

  test('a run that executes no authored tests has no lane to account for', () => {
    expect(resolveCommandInputLane({ command: 'smoke', runsTests: false, flag: 'accessible', driverInput })).toBeUndefined();
    expect(driverInput).not.toHaveBeenCalled();
  });

  test('prefers the flag, then the environment, then the driver instance', () => {
    const request = { command: 'test', runsTests: true, driverInput } as const;
    expect(resolveCommandInputLane({ ...request, flag: 'accessible', environment: 'physical' })).toMatchObject({
      input: 'accessible',
      source: 'option',
    });
    expect(resolveCommandInputLane({ ...request, environment: 'accessible' })).toMatchObject({
      input: 'accessible',
      source: 'environment',
    });
    expect(resolveCommandInputLane(request)).toMatchObject({ input: 'physical', source: 'driver' });
  });

  test('does not read the driver instance when a flag or environment names the lane', () => {
    resolveCommandInputLane({ command: 'test', runsTests: true, flag: 'physical', driverInput });
    resolveCommandInputLane({ command: 'test', runsTests: true, environment: 'physical', driverInput });
    expect(driverInput).not.toHaveBeenCalled();
  });

  test('labels how an accessible lane is masked by who owns the driver, and never a physical lane', () => {
    expect(resolveCommandInputLane({ command: 'smoke', runsTests: true, flag: 'accessible' })).toEqual({
      input: 'accessible',
      source: 'option',
      masking: 'host-masked',
      policyEnforced: false,
    });
    expect(resolveCommandInputLane({ command: 'test', runsTests: true, flag: 'accessible' })).toEqual({
      input: 'accessible',
      source: 'option',
      masking: 'verified-masked',
      policyEnforced: false,
    });
    expect(resolveCommandInputLane({ command: 'smoke', runsTests: true, flag: 'physical' })).toEqual({
      input: 'physical',
      source: 'option',
      policyEnforced: false,
    });
  });

  test.each([
    ['flag', { flag: 'both' }, '--input must be accessible or physical.'],
    ['environment', { environment: 'Physical' }, 'DESKTOP_INPUT must be accessible or physical.'],
    ['empty flag', { flag: '' }, '--input must be accessible or physical.'],
    ['empty environment', { environment: '' }, 'DESKTOP_INPUT must be accessible or physical.'],
  ] as const)('rejects an invalid %s', (_name, request, message) => {
    expect(() => resolveCommandInputLane({ command: 'test', runsTests: true, ...request })).toThrow(
      expect.objectContaining({ message, code: 'config' }),
    );
  });
});

describe('driver instance input', () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'storybook-input-lane-'));
    fs.mkdirSync(path.join(root, 'storybook-desktop.generated'));
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (contents: string) =>
    fs.writeFileSync(path.join(root, 'storybook-desktop.generated', 'driver-manifest.win32.json'), contents);

  test('reads the lane a driver instance was started for', () => {
    write(JSON.stringify({ wdio: { input: 'accessible' } }));
    expect(readDriverInstanceInput(root, 'win32')).toBe('accessible');
  });

  test.each([
    ['no lane', JSON.stringify({ wdio: {} })],
    ['an unknown lane', JSON.stringify({ wdio: { input: 'both' } })],
    ['no wdio settings', JSON.stringify({})],
    ['malformed JSON', '{'],
    ['a non-object manifest', 'null'],
  ])('declares none for %s', (_name, contents) => {
    write(contents);
    expect(readDriverInstanceInput(root, 'win32')).toBeUndefined();
  });

  test('declares none without a manifest for the endpoint', () => {
    expect(readDriverInstanceInput(root, 'macos')).toBeUndefined();
  });
});
