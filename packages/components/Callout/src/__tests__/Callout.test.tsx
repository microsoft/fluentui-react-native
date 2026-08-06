import * as React from 'react';
import { act } from 'react';
import { Text } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Callout } from '..';
import type { CalloutNativeCommands } from '..';
import { Commands } from '../CalloutNativeComponent';

describe('Callout', () => {
  it('renders without default themed styling', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Callout />);
    });
    expect(component!.toJSON()).toMatchObject({
      type: 'RCTCallout',
      props: {
        directionalHint: 'bottonLeftEdge',
      },
    });
  });

  it('passes explicit props, children, and string targets to the native component', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Callout accessibilityLabel="Example callout" directionalHint="rightTopEdge" style={{ backgroundColor: 'red' }} target="anchor">
          <Text>Content</Text>
        </Callout>,
      );
    });

    expect(component!.toJSON()).toMatchObject({
      type: 'RCTCallout',
      props: {
        accessibilityLabel: 'Example callout',
        directionalHint: 'rightTopEdge',
        style: { backgroundColor: 'red' },
        target: 'anchor',
      },
      children: [{ children: ['Content'] }],
    });
  });

  it('dispatches imperative commands to the native ref and clears its public ref', () => {
    const componentRef = React.createRef<CalloutNativeCommands>();
    const blurWindow = jest.spyOn(Commands, 'blurWindow').mockImplementation(() => {});
    const focusWindow = jest.spyOn(Commands, 'focusWindow').mockImplementation(() => {});
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Callout componentRef={componentRef} />);
    });

    expect(componentRef.current).toEqual({
      blurWindow: expect.any(Function),
      focusWindow: expect.any(Function),
    });

    componentRef.current!.blurWindow();
    componentRef.current!.focusWindow();
    const nativeRef = expect.objectContaining({ _nativeTag: expect.any(Number) });
    expect(blurWindow).toHaveBeenCalledWith(nativeRef);
    expect(focusWindow).toHaveBeenCalledWith(nativeRef);

    act(() => component!.unmount());
    expect(componentRef.current).toBeNull();
  });
});
