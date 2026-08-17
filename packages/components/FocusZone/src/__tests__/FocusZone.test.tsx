/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { isPhasedComponent, useSlot } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';
import { render } from '@testing-library/react-native';

import { FocusZone } from '../FocusZone';

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  findNodeHandle: jest.fn(() => 42),
}));

type FocusZoneSlotConsumerProps = {
  focusZone: SlotProp<typeof FocusZone>;
};

function FocusZoneSlotConsumer({ focusZone }: FocusZoneSlotConsumerProps) {
  const FocusZoneSlot = useSlot(FocusZone, focusZone);
  return (
    <FocusZoneSlot accessibilityHint="rendered as a slot" testID="slotted-focus-zone">
      <Text>Slot content</Text>
    </FocusZoneSlot>
  );
}

describe('FocusZone', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses phased rendering and applies no styling defaults', async () => {
    expect(isPhasedComponent(FocusZone)).toBe(true);

    const component = await render(<FocusZone testID="focus-zone" />);
    const focusZone = component.getByTestId('focus-zone');

    expect(focusZone.type).toBe('RCTFocusZone');
    expect(focusZone.props.navigateAtEnd).toBe('NavigateStopAtEnds');
    expect(focusZone.props.style).toBeUndefined();
  });

  it('forwards native behavior, accessibility, style, callbacks, and children', async () => {
    const onFocus = jest.fn();
    const style = { opacity: 0.5 };
    const component = await render(
      <FocusZone
        accessibilityLabel="Formatting tools"
        disabled
        focusZoneDirection="vertical"
        navigationOrderInRenderOrder
        onFocus={onFocus}
        style={style}
        tabKeyNavigation="Normal"
        testID="focus-zone"
        use2DNavigation
      >
        <Text>FocusZone content</Text>
      </FocusZone>,
    );
    const focusZone = component.getByTestId('focus-zone');

    expect(focusZone.props).toMatchObject({
      accessibilityLabel: 'Formatting tools',
      disabled: true,
      focusZoneDirection: 'vertical',
      navigationOrderInRenderOrder: true,
      onFocus,
      tabKeyNavigation: 'Normal',
      use2DNavigation: true,
    });
    expect(StyleSheet.flatten(focusZone.props.style)).toEqual(style);
    expect(component.getByText('FocusZone content')).toBeTruthy();
  });

  it('maps circular navigation to the native end behavior', async () => {
    const component = await render(<FocusZone isCircularNavigation testID="focus-zone" />);

    expect(component.getByTestId('focus-zone').props.navigateAtEnd).toBe('NavigateWrap');
  });

  it('forwards a registered native identifier as the default tabbable element', async () => {
    const component = await render(<FocusZone defaultTabbableElement="preferred-item" testID="focus-zone" />);

    expect(component.getByTestId('focus-zone').props.defaultTabbableElement).toBe('preferred-item');
  });

  it('resolves a default tabbable element ref to its native handle', async () => {
    const defaultTabbableElement = React.createRef<View>();
    const component = await render(
      <FocusZone defaultTabbableElement={defaultTabbableElement} testID="focus-zone">
        <View ref={defaultTabbableElement} />
      </FocusZone>,
    );

    expect(defaultTabbableElement.current).not.toBeNull();
    expect(component.getByTestId('focus-zone').props.defaultTabbableElement).toBe(42);
  });

  it('forwards componentRef without exposing it as a native prop', async () => {
    const componentRef = React.createRef<View>();
    const component = await render(<FocusZone componentRef={componentRef} testID="focus-zone" />);
    const focusZone = component.getByTestId('focus-zone');

    expect(componentRef.current).not.toBeNull();
    expect(focusZone.props.componentRef).toBeUndefined();
  });

  it('can be consumed as a slot with merged render props', async () => {
    const component = await render(
      <FocusZoneSlotConsumer focusZone={{ accessibilityLabel: 'Slotted FocusZone', focusZoneDirection: 'horizontal' }} />,
    );
    const focusZone = component.getByTestId('slotted-focus-zone');

    expect(focusZone.props).toMatchObject({
      accessibilityHint: 'rendered as a slot',
      accessibilityLabel: 'Slotted FocusZone',
      focusZoneDirection: 'horizontal',
    });
    expect(component.getByText('Slot content')).toBeTruthy();
  });
});
