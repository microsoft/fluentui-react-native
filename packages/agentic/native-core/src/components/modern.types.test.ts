import type * as React from 'react';
import type { SlotProp } from '@fluentui-react-native/framework-base';
import type { CalloutProps, CalloutHandle, FocusZoneProps, FocusZoneHandle, NativeViewTarget } from '../macos';

type Assert<T extends true> = T;
type LegacyCalloutFields = Extract<keyof CalloutProps, 'componentRef' | 'target' | 'anchorRect' | 'setInitialFocus'>;
type LegacyFocusFields = Extract<keyof FocusZoneProps, 'componentRef' | 'defaultTabbableElement' | 'focusZoneDirection'>;
type NoLegacyCallout = Assert<LegacyCalloutFields extends never ? true : false>;
type NoLegacyFocus = Assert<LegacyFocusFields extends never ? true : false>;
type ModernCallout = typeof import('./callout/Callout').Callout;
type ModernFocusZone = typeof import('./focus-zone/FocusZone').FocusZone;

function contracts(target: NativeViewTarget, calloutRef: React.Ref<CalloutHandle>, zoneRef: React.Ref<FocusZoneHandle>) {
  const calloutSlot: SlotProp<ModernCallout> = { open: true, anchor: { kind: 'view', target }, ref: calloutRef };
  const zoneSlot: SlotProp<ModernFocusZone> = { direction: 'vertical', ref: zoneRef };
  const noLegacyCallout: NoLegacyCallout = true;
  const noLegacyFocus: NoLegacyFocus = true;
  return { calloutSlot, zoneSlot, noLegacyCallout, noLegacyFocus };
}
void contracts;

it('checks modern refs, slots and legacy-field exclusion', () => {
  expect(true).toBe(true);
});
