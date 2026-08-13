/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { act, render } from '@testing-library/react-native';
import { isPhasedComponent, useSlot } from '@fluentui-react-native/framework-base';
import type { SlotProp } from '@fluentui-react-native/framework-base';

import { Callout } from '../Callout';
import type { CalloutHandle } from '../Callout.types';
import { Commands } from '../CalloutNativeComponent';

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  findNodeHandle: jest.fn(() => 42),
}));

type CalloutSlotConsumerProps = {
  callout: SlotProp<typeof Callout>;
};

function CalloutSlotConsumer({ callout }: CalloutSlotConsumerProps) {
  const CalloutSlot = useSlot(Callout, callout);
  return (
    <CalloutSlot accessibilityHint="rendered as a slot" testID="slotted-callout">
      <Text>Slot content</Text>
    </CalloutSlot>
  );
}

describe('Callout', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses phased rendering and applies native-safe default styling', async () => {
    expect(isPhasedComponent(Callout)).toBe(true);

    const component = await render(<Callout testID="callout" />);
    const callout = component.getByTestId('callout');

    expect(callout.type).toBe('RCTCallout');
    expect(StyleSheet.flatten(callout.props.style)).toMatchSnapshot();
  });

  it('translates caller-supplied appearance values and preserves user style precedence', async () => {
    const component = await render(
      <Callout
        backgroundColor="red"
        borderColor="green"
        borderRadius={8}
        borderWidth={2}
        maxHeight={240}
        maxWidth="80%"
        minWidth={120}
        style={{ backgroundColor: 'blue', opacity: 0.5 }}
        testID="callout"
      />,
    );
    const callout = component.getByTestId('callout');

    expect(StyleSheet.flatten(callout.props.style)).toEqual({
      position: 'absolute',
      backgroundColor: 'blue',
      borderColor: 'green',
      borderRadius: 8,
      borderWidth: 2,
      maxHeight: 240,
      maxWidth: '80%',
      minWidth: 120,
      opacity: 0.5,
    });
    expect(callout.props.backgroundColor).toBeUndefined();
    expect(callout.props.maxHeight).toBe(240);
    expect(callout.props.maxWidth).toBeUndefined();
    expect(callout.props.minWidth).toBe(120);
  });

  it('forwards native behavior, accessibility, callbacks, and children', async () => {
    const onDismiss = jest.fn();
    const onShow = jest.fn();
    const anchorRect = { screenX: 10, screenY: 20, width: 30, height: 40 };
    const component = await render(
      <Callout
        accessibilityLabel="Formatting options"
        anchorRect={anchorRect}
        beakWidth={12}
        directionalHint="rightTopEdge"
        dismissBehaviors={['preventDismissOnClickOutside']}
        gapSpace={4}
        minPadding={8}
        onDismiss={onDismiss}
        onShow={onShow}
        target="editor-anchor"
        testID="callout"
      >
        <Text>Callout content</Text>
      </Callout>,
    );
    const callout = component.getByTestId('callout');

    expect(callout.props).toMatchObject({
      accessibilityLabel: 'Formatting options',
      anchorRect,
      beakWidth: 12,
      directionalHint: 'rightTopEdge',
      dismissBehaviors: ['preventDismissOnClickOutside'],
      gapSpace: 4,
      minPadding: 8,
      onDismiss,
      onShow,
      target: 'editor-anchor',
    });
    expect(component.getByText('Callout content')).toBeTruthy();
  });

  it('resolves a React target ref to its native handle', async () => {
    const target = React.createRef<View>();
    const component = await render(
      <>
        <View ref={target} />
        <Callout target={target} testID="callout" />
      </>,
    );

    expect(target.current).not.toBeNull();
    expect(component.getByTestId('callout').props.target).toBe(42);
  });

  it('exposes native window commands through componentRef', async () => {
    const focusWindow = jest.spyOn(Commands, 'focusWindow').mockImplementation(() => undefined);
    const blurWindow = jest.spyOn(Commands, 'blurWindow').mockImplementation(() => undefined);
    const componentRef = React.createRef<CalloutHandle>();

    await render(<Callout componentRef={componentRef} testID="callout" />);

    await act(async () => {
      componentRef.current?.focusWindow();
      componentRef.current?.blurWindow();
    });

    expect(focusWindow).toHaveBeenCalledTimes(1);
    expect(blurWindow).toHaveBeenCalledTimes(1);
  });

  it('can be consumed as a slot with merged render props', async () => {
    const component = await render(<CalloutSlotConsumer callout={{ accessibilityLabel: 'Slotted Callout', target: 'slot-anchor' }} />);
    const callout = component.getByTestId('slotted-callout');

    expect(callout.props).toMatchObject({
      accessibilityHint: 'rendered as a slot',
      accessibilityLabel: 'Slotted Callout',
      target: 'slot-anchor',
    });
    expect(component.getByText('Slot content')).toBeTruthy();
  });
});
