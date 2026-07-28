/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from 'react';

import type { ComponentProps, ComponentState, OptionalSlot, OptionalSlotProp, Slot, SlotComponent, SlotProp } from '../index';

type Extends<A, B> = [A] extends [B] ? true : false;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

type RootProps = {
  requiredRootProp: string;
  children?: React.ReactNode;
};

type ContentProps = {
  children?: React.ReactNode;
  tone?: 'neutral' | 'brand';
};

type MissingRootProps = {
  unrelated?: string;
};

type RootComponent = React.FunctionComponent<RootProps>;
type ContentComponent = React.FunctionComponent<ContentProps>;

type TestSlots = {
  root: Slot<RootComponent>;
  content: Slot<ContentComponent>;
  optional: OptionalSlot<ContentComponent>;
};

type TestComponentProps = ComponentProps<TestSlots>;
type TestComponentState = ComponentState<TestSlots>;

const componentPropsRequireRootProps: Expect<Equal<Extends<MissingRootProps, TestComponentProps>, false>> = true;
const componentPropsAllowOmittedSlots: Expect<Extends<{ requiredRootProp: string }, TestComponentProps>> = true;
const componentPropsAllowShorthand: Expect<Extends<{ requiredRootProp: string; content: string }, TestComponentProps>> = true;
const componentPropsAllowOptionalNull: Expect<Extends<{ requiredRootProp: string; optional: null }, TestComponentProps>> = true;
const componentPropsRejectRequiredNull: Expect<Equal<Extends<{ requiredRootProp: string; content: null }, TestComponentProps>, false>> =
  true;
const requiredStateSlotHasConcreteProps: Expect<Equal<TestComponentState['content'], SlotComponent<ContentProps>>> = true;
const optionalStateSlotHasConcretePropsOrUndefined: Expect<Equal<TestComponentState['optional'], SlotComponent<ContentProps> | undefined>> =
  true;
const componentAcceptanceTypesRemainValidSlots: Expect<Equal<Slot<React.ComponentType<ContentProps>>, React.ComponentType<ContentProps>>> =
  true;
const slotPropUsesComponentProps: Expect<Extends<ContentProps, SlotProp<ContentComponent>>> = true;
const optionalSlotPropAllowsNull: Expect<Extends<null, OptionalSlotProp<ContentComponent>>> = true;

describe('component slot type consistency', () => {
  it('maps declared slots to public props and resolved state', () => {
    expect(componentPropsRequireRootProps).toBe(true);
    expect(componentPropsAllowOmittedSlots).toBe(true);
    expect(componentPropsAllowShorthand).toBe(true);
    expect(componentPropsAllowOptionalNull).toBe(true);
    expect(componentPropsRejectRequiredNull).toBe(true);
    expect(requiredStateSlotHasConcreteProps).toBe(true);
    expect(optionalStateSlotHasConcretePropsOrUndefined).toBe(true);
    expect(componentAcceptanceTypesRemainValidSlots).toBe(true);
    expect(slotPropUsesComponentProps).toBe(true);
    expect(optionalSlotPropAllowsNull).toBe(true);
  });
});
