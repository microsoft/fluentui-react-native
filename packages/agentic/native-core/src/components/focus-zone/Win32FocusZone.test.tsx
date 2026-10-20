/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, UIManager, View } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { isPhasedComponent } from '@fluentui-react-native/framework-base';

import { resolveTarget, useNativeViewTarget } from '../nativeTarget';
import type { NativeViewTarget } from '../nativeTarget';
import type { NativeOperationOutcome } from '../nativeOperation';
import type { FocusZoneCommands, FocusZoneHandle, FocusZoneProps } from './FocusZone.types';
import { FocusZone } from './Win32FocusZone';

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  findNodeHandle: jest.fn(() => 42),
}));

const focusEvent = (target: number) => ({ nativeEvent: { target } });
// Host mocks share one focus mock across instances, so each spy starts from a cleared count.
const spyFocus = (instance: { focus(): void }) =>
  jest
    .spyOn(instance, 'focus')
    .mockImplementation(() => undefined)
    .mockClear();

interface FixtureProps extends FocusZoneProps {
  child?: React.RefObject<NativeViewTarget | null>;
  withDefault?: boolean;
}

function Fixture({ child, withDefault, ...props }: FixtureProps) {
  const inner = useNativeViewTarget();
  if (child) child.current = inner.target;
  return (
    <FocusZone testID="zone" {...(withDefault && { defaultTarget: inner.target })} {...props}>
      <View ref={inner.ref} focusable testID="inner" />
    </FocusZone>
  );
}

describe('Win32 FocusZone adapter', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    jest.spyOn(UIManager, 'getViewManagerConfig').mockReturnValue({} as ReturnType<typeof UIManager.getViewManagerConfig>);
  });
  afterEach(() => jest.restoreAllMocks());

  it('uses phased rendering and requires the Win32 host registration', async () => {
    expect(isPhasedComponent(FocusZone)).toBe(true);
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.replaceProperty(Platform, 'OS', 'windows');
    await expect(render(<Fixture />)).rejects.toThrow(/requires the Office Win32 host/);
    jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    jest.mocked(UIManager.getViewManagerConfig).mockReturnValue(undefined);
    await expect(render(<Fixture />)).rejects.toThrow(/RCTFocusZone registration/);
    error.mockRestore();
  });

  it('maps navigation props to the host legacy props', async () => {
    const component = await render(<Fixture withDefault />);
    expect(component.getByTestId('zone').props).toMatchObject({
      defaultTabbableElement: 42,
      focusZoneDirection: 'bidirectional',
      use2DNavigation: false,
      navigateAtEnd: 'NavigateStopAtEnds',
      tabKeyNavigation: 'None',
    });
    await component.rerender(<Fixture direction="vertical" navigation="spatial" arrowBoundary="wrap" tabNavigation="cycle" disabled />);
    expect(component.getByTestId('zone').props.defaultTabbableElement).toBeUndefined();
    expect(component.getByTestId('zone').props).toMatchObject({
      focusZoneDirection: 'vertical',
      use2DNavigation: true,
      navigateAtEnd: 'NavigateWrap',
      tabKeyNavigation: 'NavigateWrap',
      disabled: true,
    });
    await component.rerender(<Fixture tabNavigation="native" />);
    expect(component.getByTestId('zone').props.tabKeyNavigation).toBe('Normal');
    await component.rerender(<Fixture tabNavigation="stop" />);
    expect(component.getByTestId('zone').props.tabKeyNavigation).toBe('NavigateStopAtEnds');
    await component.unmount();
  });

  it('focuses an explicit target and confirms it from the bubbled focus event', async () => {
    const commands = React.createRef<FocusZoneCommands>();
    const child = React.createRef<NativeViewTarget>();
    const onFocus = jest.fn();
    const component = await render(<Fixture commandsRef={commands} child={child} onFocus={onFocus} />);
    const focus = spyFocus(resolveTarget(child.current).instance);
    expect(await commands.current.requestFocus('first')).toEqual({ status: 'unsupported' });
    expect(await commands.current.requestFocus('last')).toEqual({ status: 'unsupported' });
    let result: Promise<NativeOperationOutcome>;
    await act(async () => {
      result = commands.current.requestFocus(child.current);
    });
    expect(focus).toHaveBeenCalledTimes(1);
    const event = focusEvent(42);
    await fireEvent(component.getByTestId('zone'), 'focus', event);
    expect(await result).toEqual({ status: 'confirmed' });
    expect(onFocus).toHaveBeenCalledWith(event);
    expect(await commands.current.requestFocus(child.current)).toEqual({ status: 'confirmed' });
    expect(focus).toHaveBeenCalledTimes(1);
    await component.unmount();
  });

  it('asks the host zone to focus its default element and confirms any descendant focus', async () => {
    const commands = React.createRef<FocusZoneCommands>();
    const zone = React.createRef<FocusZoneHandle>();
    const component = await render(<Fixture ref={zone} commandsRef={commands} />);
    const focus = spyFocus(zone.current);
    let result: Promise<NativeOperationOutcome>;
    await act(async () => {
      result = commands.current.requestFocus();
    });
    expect(focus).toHaveBeenCalledTimes(1);
    await fireEvent(component.getByTestId('zone'), 'focus', focusEvent(7));
    expect(await result).toEqual({ status: 'confirmed' });
    expect(await commands.current.requestFocus('default')).toEqual({ status: 'confirmed' });
    await fireEvent(component.getByTestId('zone'), 'blur', focusEvent(7));
    jest.useFakeTimers();
    await act(async () => {
      result = commands.current.requestFocus('default', { timeoutMs: 10 });
      jest.advanceTimersByTime(10);
    });
    expect(await result).toEqual({ status: 'timed-out' });
    jest.useRealTimers();
    await component.unmount();
  });

  it('focuses the default target for a default request and cancels pending requests on unmount', async () => {
    const commands = React.createRef<FocusZoneCommands>();
    const child = React.createRef<NativeViewTarget>();
    const component = await render(<Fixture commandsRef={commands} child={child} withDefault />);
    const focus = spyFocus(resolveTarget(child.current).instance);
    let result: Promise<NativeOperationOutcome>;
    await act(async () => {
      result = commands.current.requestFocus('default');
    });
    expect(focus).toHaveBeenCalledTimes(1);
    await component.unmount();
    expect(await result).toEqual({ status: 'cancelled' });
  });
});
