import { createDesktopInputLane, desktopInputEnvironment, parseDesktopInputLane, requestedDesktopInputLane } from './lane.js';

describe('requested desktop input lane', () => {
  test('the flag wins over the environment', () => {
    expect(requestedDesktopInputLane({ flag: 'physical', environment: 'accessible' })).toEqual({ input: 'physical', source: 'option' });
  });

  test('the environment applies when there is no flag', () => {
    expect(requestedDesktopInputLane({ environment: 'accessible' })).toEqual({ input: 'accessible', source: 'environment' });
    expect(requestedDesktopInputLane({})).toBeUndefined();
  });

  test('an empty value is invalid rather than unset, and an error names where it came from', () => {
    expect(() => requestedDesktopInputLane({ environment: '' })).toThrow(`${desktopInputEnvironment} must be accessible or physical.`);
    expect(() => requestedDesktopInputLane({ flag: 'fast' })).toThrow('--input must be accessible or physical.');
    expect(() => parseDesktopInputLane('Physical', 'x')).toThrow(expect.objectContaining({ code: 'config' }));
  });
});

describe('createDesktopInputLane', () => {
  test('an accessible lane says how it was masked, and neither lane claims enforcement yet', () => {
    expect(createDesktopInputLane('accessible', 'option')).toEqual({
      input: 'accessible',
      source: 'option',
      masking: 'host-masked',
      policyEnforced: false,
    });
    expect(createDesktopInputLane('accessible', 'driver', 'verified-masked')).toMatchObject({
      masking: 'verified-masked',
      source: 'driver',
    });
    expect(createDesktopInputLane('physical', 'environment')).toEqual({ input: 'physical', source: 'environment', policyEnforced: false });
  });
});
