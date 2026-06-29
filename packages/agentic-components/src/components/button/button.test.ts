import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { Button } from './button';

describe('Button component tests', () => {
  it('renders with a title', () => {
    let component: renderer.ReactTestRenderer;
    renderer.act(() => {
      component = renderer.create(React.createElement(Button, { title: 'Click me' }));
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('renders in a disabled state', () => {
    let component: renderer.ReactTestRenderer;
    renderer.act(() => {
      component = renderer.create(React.createElement(Button, { title: 'Disabled', disabled: true }));
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('fires onPress when pressed', () => {
    const onPress = jest.fn();
    let component: renderer.ReactTestRenderer;
    renderer.act(() => {
      component = renderer.create(React.createElement(Button, { title: 'Press', onPress }));
    });
    const pressable = component!.root.findByProps({ accessibilityRole: 'button' });
    renderer.act(() => {
      pressable.props.onPress({});
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
