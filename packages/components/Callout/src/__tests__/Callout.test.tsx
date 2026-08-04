import * as React from 'react';
import { act } from 'react';
import { Text } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Callout } from '..';
import type { CalloutNativeCommands } from '..';

describe('Callout', () => {
  it('renders without default themed styling', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Callout />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('passes explicit props, children, and string targets to the native component', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Callout accessibilityLabel="Example callout" style={{ backgroundColor: 'red' }} target="anchor">
          <Text>Content</Text>
        </Callout>,
      );
    });

    expect(component!.toJSON()).toMatchObject({
      type: 'RCTCallout',
      props: {
        accessibilityLabel: 'Example callout',
        style: { backgroundColor: 'red' },
        target: 'anchor',
      },
      children: [{ children: ['Content'] }],
    });
  });

  it('exposes and clears its imperative ref', () => {
    const componentRef = React.createRef<CalloutNativeCommands>();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Callout componentRef={componentRef} />, {
        createNodeMock: () => ({}),
      });
    });

    expect(componentRef.current).toEqual({
      blurWindow: expect.any(Function),
      focusWindow: expect.any(Function),
    });

    act(() => component!.unmount());
    expect(componentRef.current).toBeNull();
  });
});
