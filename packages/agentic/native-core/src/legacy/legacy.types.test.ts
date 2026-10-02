import * as root from '../index';
import { Callout, FocusZone } from './index';
import type { CalloutProps, FocusZoneProps } from './index';

const calloutProps: CalloutProps = { target: 'anchor' };
const focusZoneProps: FocusZoneProps = { focusZoneDirection: 'horizontal' };

// @ts-expect-error CalloutProps is available only from the legacy entrypoint.
const rootCalloutProps: root.CalloutProps = calloutProps;
// @ts-expect-error FocusZoneProps is available only from the legacy entrypoint.
const rootFocusZoneProps: root.FocusZoneProps = focusZoneProps;

// @ts-expect-error Callout is not exported from the root entrypoint.
const rootCalloutKey: keyof typeof root = 'Callout';
// @ts-expect-error FocusZone is not exported from the root entrypoint.
const rootFocusZoneKey: keyof typeof root = 'FocusZone';

describe('Legacy entrypoint types', () => {
  it('exposes the wrappers only from legacy', () => {
    expect(Callout).toBeDefined();
    expect(FocusZone).toBeDefined();
    expect(root).not.toHaveProperty(rootCalloutKey);
    expect(root).not.toHaveProperty(rootFocusZoneKey);
  });

  it('retains the legacy public prop contracts', () => {
    expect(rootCalloutProps).toBe(calloutProps);
    expect(rootFocusZoneProps).toBe(focusZoneProps);
  });
});
