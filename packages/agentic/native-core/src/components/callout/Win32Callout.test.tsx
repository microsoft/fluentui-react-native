/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { Platform, StyleSheet, UIManager, View } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { isPhasedComponent } from '@fluentui-react-native/framework-base';

import { Commands } from '../../specs/components/CalloutNativeComponent';
import { resolveTarget, useNativeViewTarget } from '../nativeTarget';
import type { NativeViewTarget } from '../nativeTarget';
import type { CalloutAnchor, CalloutHandle, CalloutProps } from './Callout.types';
import { Callout } from './Win32Callout';
import type { Win32CalloutProps } from './Win32Callout';

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  findNodeHandle: jest.fn(() => 42),
}));

type Rendered = Awaited<ReturnType<typeof render>>;

function hostView(component: Rendered) {
  let host = component.getByTestId('content').parent;
  while (host && !host.props.onShow) host = host.parent;
  if (!host) throw new Error('Missing host Callout ancestor');
  return host;
}

const focusEvent = (target: number) => ({ nativeEvent: { target }, stopPropagation: jest.fn() });
const keyEvent = (key: string, modifiers: { shiftKey?: boolean } = {}) => ({
  nativeEvent: { key, ...modifiers },
  stopPropagation: jest.fn(),
});

interface FixtureProps extends Partial<Omit<Win32CalloutProps, 'anchor'>> {
  anchorKind?: CalloutAnchor['kind'];
  child?: React.RefObject<NativeViewTarget | null>;
  anchorTarget?: React.RefObject<NativeViewTarget | null>;
}

function Fixture({ anchorKind = 'view', child, anchorTarget, content, ...props }: FixtureProps) {
  const anchor = useNativeViewTarget();
  const inner = useNativeViewTarget();
  if (child) child.current = inner.target;
  if (anchorTarget) anchorTarget.current = anchor.target;
  const calloutAnchor: CalloutAnchor =
    anchorKind === 'view' ? { kind: 'view', target: anchor.target } : { kind: 'point', relativeTo: anchor.target, point: { x: 0, y: 0 } };
  return (
    <>
      <View ref={anchor.ref} />
      <Callout open anchor={calloutAnchor} content={{ testID: 'content', ...content }} {...props}>
        <View ref={inner.ref} focusable testID="inner" />
      </Callout>
    </>
  );
}

describe('Win32 Callout adapter', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    jest.spyOn(UIManager, 'getViewManagerConfig').mockReturnValue({} as ReturnType<typeof UIManager.getViewManagerConfig>);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('uses phased rendering and requires the Win32 host registration and a view anchor', async () => {
    expect(isPhasedComponent(Callout)).toBe(true);
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(render(<Fixture anchorKind="point" />)).rejects.toThrow(/only view anchors/);
    jest.replaceProperty(Platform, 'OS', 'macos');
    await expect(render(<Fixture />)).rejects.toThrow(/requires the Office Win32 host/);
    jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
    jest.mocked(UIManager.getViewManagerConfig).mockReturnValue(undefined);
    await expect(render(<Fixture />)).rejects.toThrow(/RCTCallout registration/);
    error.mockRestore();
  });

  it('configures the host and lifts the surface background and corner radius to the host window', async () => {
    const component = await render(
      <Fixture
        placement={{ side: 'top', align: 'center', gap: 4 }}
        content={{ style: { backgroundColor: 'white', borderRadius: 8, padding: 12 } }}
      />,
    );
    const host = hostView(component);
    expect(host.props).toMatchObject({
      target: 42,
      directionalHint: 'topCenter',
      gapSpace: 4,
      dismissBehaviors: ['preventDismissOnKeyDown'],
      setInitialFocus: true,
    });
    expect(StyleSheet.flatten(host.props.style)).toMatchObject({ backgroundColor: 'white', borderRadius: 8 });
    await component.unmount();
  });

  it('reports readiness from onShow once and confirms first focus from the host initial focus', async () => {
    const ref = React.createRef<CalloutHandle>();
    const ready = jest.fn();
    const component = await render(<Fixture ref={ref} onReady={ready} />);
    const host = hostView(component);
    expect(ref.current.getPresentation()).toBeNull();
    await fireEvent(component.getByTestId('content'), 'focus', focusEvent(42));
    await act(async () => {
      host.props.onShow();
      host.props.onShow();
    });
    expect(ready).toHaveBeenCalledTimes(1);
    const presentation = ref.current.getPresentation();
    expect(ready).toHaveBeenCalledWith({ presentation });
    expect(await ref.current.requestFocus(presentation, 'first')).toEqual({ status: 'confirmed' });
    expect(await ref.current.requestFocus(presentation, 'last')).toEqual({ status: 'unsupported' });
    expect(await ref.current.close(presentation)).toEqual({ status: 'unsupported' });
    expect(await ref.current.reposition(presentation)).toEqual({ status: 'unsupported' });
    await fireEvent(component.getByTestId('content'), 'blur', focusEvent(42));
    expect(await ref.current.requestFocus(presentation, 'first')).toEqual({ status: 'not-mounted' });
    await component.unmount();
  });

  it('focuses an explicit target in the popup window and confirms it from the focus event', async () => {
    const ref = React.createRef<CalloutHandle>();
    const child = React.createRef<NativeViewTarget>();
    const focusWindow = jest.spyOn(Commands, 'focusWindow').mockImplementation(() => undefined);
    const component = await render(<Fixture ref={ref} child={child} />);
    await act(async () => hostView(component).props.onShow());
    const presentation = ref.current.getPresentation();
    const instance = resolveTarget(child.current).instance;
    const focus = jest.spyOn(instance, 'focus').mockImplementation(() => undefined);
    let result: ReturnType<CalloutHandle['requestFocus']>;
    await act(async () => {
      result = ref.current.requestFocus(presentation, child.current);
    });
    expect(focusWindow).toHaveBeenCalledTimes(1);
    expect(focus).toHaveBeenCalledTimes(1);
    await fireEvent(component.getByTestId('content'), 'focus', focusEvent(42));
    expect(await result).toEqual({ status: 'confirmed' });
    await component.unmount();
  });

  it('reports Escape from the content after the caller handler and closes the presentation', async () => {
    const ref = React.createRef<CalloutHandle>();
    const dismissed = jest.fn();
    const keyDown = jest.fn();
    const component = await render(
      <Fixture ref={ref} onDismissed={dismissed} content={{ onKeyDown: keyDown } as CalloutProps['content']} />,
    );
    await act(async () => hostView(component).props.onShow());
    const presentation = ref.current.getPresentation();
    const escape = keyEvent('Escape');
    await fireEvent(component.getByTestId('content'), 'keyDown', escape);
    expect(keyDown).toHaveBeenCalledTimes(1);
    expect(escape.stopPropagation).toHaveBeenCalled();
    expect(dismissed).toHaveBeenCalledWith({ presentation, reason: 'escape' });
    expect(component.queryByTestId('content')).toBeNull();
    expect(ref.current.getPresentation()).toBeNull();
    await component.unmount();
  });

  it('leaves focus in place without initial focus, so first focus is unsupported', async () => {
    const ref = React.createRef<CalloutHandle>();
    const component = await render(<Fixture ref={ref} initialFocus="none" />);
    const host = hostView(component);
    expect(host.props.setInitialFocus).toBe(false);
    await act(async () => host.props.onShow());
    expect(await ref.current.requestFocus(ref.current.getPresentation(), 'first')).toEqual({ status: 'unsupported' });
    await component.unmount();
  });

  it('stops content events at the popup boundary, as a separate native window would', async () => {
    const onFocus = jest.fn();
    const component = await render(<Fixture content={{ onFocus } as CalloutProps['content']} />);
    const focus = focusEvent(42);
    const keyUp = keyEvent('a');
    await fireEvent(component.getByTestId('content'), 'focus', focus);
    await fireEvent(component.getByTestId('content'), 'keyUp', keyUp);
    expect(onFocus).toHaveBeenCalledWith(focus);
    expect(focus.stopPropagation).toHaveBeenCalled();
    expect(keyUp.stopPropagation).toHaveBeenCalled();
    await component.unmount();
  });

  it('cycles Tab by default and dismisses on Tab when Tab exits', async () => {
    const dismissed = jest.fn();
    const cycling = await render(<Fixture onDismissed={dismissed} />);
    await act(async () => hostView(cycling).props.onShow());
    expect(cycling.getByTestId('content').props.keyDownEvents).toBeUndefined();
    await fireEvent(cycling.getByTestId('content'), 'keyDown', keyEvent('Tab'));
    expect(dismissed).not.toHaveBeenCalled();
    await cycling.unmount();

    const exiting = await render(
      <Fixture onDismissed={dismissed} tabNavigation="dismiss" content={{ keyDownEvents: [{ key: 'a' }] } as CalloutProps['content']} />,
    );
    await act(async () => hostView(exiting).props.onShow());
    expect(exiting.getByTestId('content').props.keyDownEvents).toEqual([{ key: 'a' }, { key: 'Tab' }, { key: 'Tab', shiftKey: true }]);
    await fireEvent(exiting.getByTestId('content'), 'keyDown', keyEvent('Tab', { shiftKey: true }));
    expect(dismissed).toHaveBeenCalledWith(expect.objectContaining({ reason: 'tab-backward' }));
    expect(exiting.queryByTestId('content')).toBeNull();
    await exiting.unmount();
  });

  it('returns focus to the view anchor when Tab continues, since the host cannot continue past it', async () => {
    const anchorTarget = React.createRef<NativeViewTarget>();
    const dismissed = jest.fn();
    const component = await render(<Fixture anchorTarget={anchorTarget} onDismissed={dismissed} tabNavigation="continue" />);
    await act(async () => hostView(component).props.onShow());
    // Host mocks share one focus mock across instances.
    const focus = jest
      .spyOn(resolveTarget(anchorTarget.current).instance, 'focus')
      .mockImplementation(() => undefined)
      .mockClear();
    await fireEvent(component.getByTestId('content'), 'keyDown', keyEvent('Tab'));
    expect(dismissed).toHaveBeenCalledWith(expect.objectContaining({ reason: 'tab-forward' }));
    expect(focus).toHaveBeenCalledTimes(1);
    await component.unmount();
  });

  it('runs the outermost Tab exit from a nested presentation', async () => {
    const outer = jest.fn();
    const inner = jest.fn();
    function Nested() {
      const anchor = useNativeViewTarget();
      const innerAnchor = useNativeViewTarget();
      return (
        <>
          <View ref={anchor.ref} />
          <Callout
            open
            anchor={{ kind: 'view', target: anchor.target }}
            tabNavigation="dismiss"
            content={{ testID: 'outer' }}
            onDismissed={outer}
          >
            <View ref={innerAnchor.ref} />
            <Callout
              open
              anchor={{ kind: 'view', target: innerAnchor.target }}
              tabNavigation="dismiss"
              content={{ testID: 'inner' }}
              onDismissed={inner}
            >
              <View focusable />
            </Callout>
          </Callout>
        </>
      );
    }
    const component = await render(<Nested />);
    await fireEvent(component.getByTestId('inner'), 'keyDown', keyEvent('Tab'));
    expect(outer).toHaveBeenCalledWith(expect.objectContaining({ reason: 'tab-forward' }));
    expect(inner).not.toHaveBeenCalled();
    expect(component.queryByTestId('outer')).toBeNull();
    await component.unmount();
  });

  it('holds a host light dismissal so a caller close can supersede it', async () => {
    jest.useFakeTimers();
    const dismissed = jest.fn();
    const component = await render(<Fixture onDismissed={dismissed} />);
    const host = hostView(component);
    await act(async () => host.props.onShow());
    await act(async () => host.props.onDismiss());
    expect(dismissed).not.toHaveBeenCalled();
    await act(async () => jest.advanceTimersByTime(250));
    expect(dismissed).toHaveBeenCalledWith(expect.objectContaining({ reason: 'native-light-dismiss' }));
    expect(component.queryByTestId('content')).toBeNull();

    dismissed.mockClear();
    await component.rerender(<Fixture onDismissed={dismissed} presentationKey="next" />);
    const next = hostView(component);
    await act(async () => next.props.onShow());
    await act(async () => next.props.onDismiss());
    await component.rerender(<Fixture onDismissed={dismissed} presentationKey="next" open={false} />);
    await act(async () => jest.advanceTimersByTime(250));
    expect(dismissed).not.toHaveBeenCalled();
    await component.unmount();
  });
});
